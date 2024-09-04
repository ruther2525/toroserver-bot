import prisma from "../prisma";
import { Client } from "discord.js";

const VCChannels = [];

export const VC = (client: Client) => {
    client.on('channelCreate', async (channel) => {
        if (channel?.isVoiceBased() && channel?.parentId !== process.env.AUTO_VC_CATEGORY_ID) {
            console.log(`${channel.name} has been created.`);
            VCChannels.push(channel);

            await prisma.vCChannel.create({
                data: {
                    channel_id: channel.id,
                    channel_name: channel.name,
                    category_name: channel.parent?.name ?? null,
                }
            });
        }

        if (channel?.parentId === process.env.AUTO_VC_CATEGORY_ID) console.log(`${channel.name} has been created in the auto vc category.`);
    });

    client.on('voiceStateUpdate', async (oldState, newState) => {
        const _user = await prisma.user.findFirst({
            where: {
                discord_id: newState.member?.id
            }
        });
        const _channel = await prisma.vCChannel.findFirst({
            where: {
                channel_id: newState.channelId ?? oldState.channelId ?? ''
            }
        });


        // チャンネル更新
        if (_channel && (newState.channel || oldState.channel)) {
            // 1. チャンネルが初めて使用された場合、初めて使用された時間をセット&初めて使用されたメンバー数をセット
            if (
                _channel.vc_first_join_time === null
                && oldState.channelId === null && newState.channelId !== null
            ) {
                await prisma.vCChannel.update({
                    where: {
                        channel_id: newState.channelId ?? oldState.channelId ?? ''
                    },
                    data: {
                        vc_first_join_time: new Date(),
                        vc_total_member: newState.channel?.members?.size ?? null,
                        category_name: newState.channel?.parent?.name ?? null,
                    }
                });

            // 2. チャンネルが既に使用されている場合かつ、人数が1人以上いて、メンバー数がデータベースよりも多い場合、メンバー数を更新
            } else if (
                (newState.channel?.members?.size ?? 0) > (_channel.vc_total_member ?? 1)) {
                await prisma.vCChannel.update({
                    where: {
                        channel_id: newState.channelId ?? oldState.channelId ?? ''
                    },
                    data: {
                        vc_total_member: newState.channel?.members?.size ?? null,
                        category_name: newState.channel?.parent?.name ?? null,
                    }
                });

            // 3. チャンネルが既に使用されている場合かつ、誰もいなくなった場合、最後に使用された時間をセット&トータル時間を更新
            } else if (
                _channel.vc_total_member !== null
                && _channel.vc_first_join_time !== null
                && oldState.channelId !== null && newState.channelId === null
                && oldState.channelId === _channel.channel_id
                && oldState.channel?.members?.size === 1
            ) {
                await prisma.vCChannel.update({
                    where: {
                        channel_id: newState.channelId ?? oldState.channelId ?? ''
                    },
                    data: {
                        vc_last_leave_time: new Date(),
                        vc_total_sec: (_channel.vc_total_sec ?? 0) + Math.floor((new Date().getTime() - _channel.vc_first_join_time.getTime()) / 1000),
                        category_name: newState.channel?.parent?.name ?? null,
                    }
                });
            }

        // チャンネルがデータベースに存在しない場合
        } else {
            await prisma.vCChannel.create({
                data: {
                    channel_id: newState.channelId ?? '',
                    channel_name: newState.channel?.name ?? '',
                    category_name: newState.channel?.parent?.name ?? null,

                    vc_first_join_time: ((newState.channel?.members?.size ?? 0) > 0) ? new Date() : null,
                    vc_total_member: newState.channel?.members?.size ?? null,
                }
            });
            console.log(`- ${newState.channel?.name} is not in the database.`);
        }


        // チャンネル参加
        if (oldState.channelId === null && newState.channelId !== null) {
            console.log(`${newState.member?.user.tag} joined ${newState.channel?.name}`);

            // ユーザーがデータベースに存在する場合
            if (_user) {
                // ユーザー更新
                await prisma.user.update({
                    where: {
                        discord_id: _user.discord_id
                    },
                    data: {
                        discord_name: newState.member?.user.tag + (newState.member?.user.bot ? ' [BOT]' : ''),
                        discord_avatar: newState.member?.user.avatarURL() ?? null,
                        vc_last_join_time: new Date(),
                        vc_last_join_channel: newState.channelId,
                        guild_joined_date: newState.member?.joinedAt ?? null,
                    }
                });

            // ユーザーがデータベースに存在しない場合
            } else if (newState.member) {
                // ユーザー追加
                await prisma.user.create({
                    data: {
                        discord_id: newState.member.id,
                        discord_name: newState.member.user.tag + (newState.member.user.bot ? ' [BOT]' : ''),
                        discord_avatar: newState.member.user.avatarURL() ?? null,
                        vc_last_join_time: new Date(),
                        vc_last_join_channel: newState.channelId,
                        guild_joined_date: newState.member.joinedAt ?? null,
                    }
                });
                console.log(`- User ${newState.member?.user.tag} is not in the database.`);
            }

        // チャンネル退出
        } else if (newState.channelId === null && oldState.channelId !== null) {
            console.log(`${oldState.member?.user.tag} left ${oldState.channel?.name}`);

            // ユーザーがデータベースに存在する場合
            if (_user && _user.vc_last_join_time) {
                await prisma.user.update({
                    where: {
                        discord_id: _user.discord_id
                    },
                    data: {
                        discord_name: oldState.member?.user.tag + (oldState.member?.user.bot ? ' [BOT]' : ''),
                        discord_avatar: oldState.member?.user.avatarURL() ?? null,
                        vc_last_leave_time: new Date(),
                        vc_total_sec: (_user.vc_total_sec ?? 0) + Math.floor((new Date().getTime() - _user.vc_last_join_time.getTime()) / 1000),
                        guild_joined_date: oldState.member?.joinedAt ?? null,
                    }
                });
            }

        // チャンネル移動
        } else if (oldState.channelId !== null && newState.channelId !== null && oldState.channelId !== newState.channelId){
            console.log(`${oldState.member?.user.tag} moved from ${oldState.channel?.name} to ${newState.channel?.name}`);

            if (_user && _user.vc_last_join_time && _user.vc_last_join_channel) {
                await prisma.user.update({
                    where: {
                        discord_id: _user.discord_id
                    },
                    data: {
                        discord_name: newState.member?.user.tag + (newState.member?.user.bot ? ' [BOT]' : ''),
                        discord_avatar: newState.member?.user.avatarURL() ?? null,
                        vc_last_join_channel: newState.channelId,
                        guild_joined_date: newState.member?.joinedAt ?? null,
                    }
                });
            }
        // その他ミュートとかのイベント
        } else {
            // サーバーミュート
            if (oldState.serverMute !== newState.serverMute) {
                console.log(`${newState.member?.user.tag} changed serverMute to ${newState.serverMute}`);

            // サーバースピーカーミュート
            } else if (oldState.serverDeaf !== newState.serverDeaf) {
                console.log(`${newState.member?.user.tag} changed serverDeaf to ${newState.serverDeaf}`);

            // セルフミュート
            } else if (oldState.selfMute !== newState.selfMute) {
                console.log(`${newState.member?.user.tag} changed selfMute to ${newState.selfMute}`);

            // セルフスピーカーミュート
            } else if (oldState.selfDeaf !== newState.selfDeaf) {
                console.log(`${newState.member?.user.tag} changed selfDeaf to ${newState.selfDeaf}`);

            // カメラ配信
            } else if (oldState.selfVideo !== newState.selfVideo) {
                console.log(`${newState.member?.user.tag} changed selfVideo to ${newState.selfVideo}`);

            // 配信
            } else if (oldState.streaming !== newState.streaming) {
                console.log(`${newState.member?.user.tag} changed streaming to ${newState.streaming}`);

            // その他よくわからないイベント
            } else {
                console.log(`${newState.member?.user.tag} changed something else`);
            }
        }
    });

    client.on('ready', async () => {
        const dbUser = await prisma.user.findMany();

        const guild = await client.guilds.fetch(process.env.GUILD_ID ?? '');

        if (!guild) return;

        const channels = await guild.channels.fetch();

        const joinnedUser: string[] = [];

        channels.forEach(channel => {
            if (channel?.isVoiceBased()) {
                channel.members.forEach(member => {
                    joinnedUser.push(member.id);
                });
            }
        });

        channels.forEach(async channel => {
            if (channel?.isVoiceBased()) {
                VCChannels.push(channel);
                const _channel = await prisma.vCChannel.findFirst({
                    where: {
                        channel_id: channel.id
                    }
                });

                // Botがダウンしてたときの回復動作

                // チャンネル更新
                // チャンネルがデータベースに存在する場合
                if (_channel) {
                    console.log(`- ${channel.name} is in the database.`);

                    // 1. チャンネルが初めて使用された場合、初めて使用された時間をセット&初めて使用されたメンバー数をセット
                    if (
                        _channel.vc_first_join_time === null
                        && channel.members.size !== 0
                    ) {
                        await prisma.vCChannel.update({
                            where: {
                                channel_id: channel.id
                            },
                            data: {
                                vc_first_join_time: new Date(),
                                vc_total_member: channel.members.size,
                                category_name: channel.parent?.name ?? null,
                            }
                        });

                    // 2. チャンネルが既に使用されている場合かつ、人数が1人以上いて、メンバー数がデータベースよりも多い場合、メンバー数を更新
                    } else if (
                        _channel.vc_total_member !== null
                        && channel.members.size > _channel.vc_total_member
                        && _channel.vc_first_join_time !== null
                        && (
                            _channel.vc_last_leave_time === null
                            || _channel.vc_first_join_time > _channel.vc_last_leave_time
                        )
                    ) {
                        await prisma.vCChannel.update({
                            where: {
                                channel_id: channel.id
                            },
                            data: {
                                vc_total_member: channel.members.size,
                                category_name: channel.parent?.name ?? null,
                            }
                        });

                    // 3. チャンネルが既に使用されている場合かつ、誰もいなくなった場合、最後に使用された時間をセット&トータル時間を更新
                    } else if (
                        _channel.vc_total_member !== null
                        && channel.members.size === 0
                        && _channel.vc_first_join_time !== null
                        && _channel.vc_first_join_time > (_channel.vc_last_leave_time ?? new Date())
                    ) {
                        await prisma.vCChannel.update({
                            where: {
                                channel_id: channel.id
                            },
                            data: {
                                vc_last_leave_time: new Date(),
                                vc_total_sec: (_channel.vc_total_sec ?? 0) + Math.floor((new Date().getTime() - (_channel.vc_first_join_time?.getTime() ?? new Date().getTime())) / 1000),
                                category_name: channel.parent?.name ?? null,
                            }
                        });
                    }

                // チャンネルがデータベースに存在しない場合
                } else {
                    console.log(`- ${channel.name} is not in the database.`);
                    await prisma.vCChannel.create({
                        data: {
                            channel_id: channel.id,
                            channel_name: channel.name,
                            category_name: channel.parent?.name ?? null,
                        }
                    });
                }

                // メンバー更新
                // チャンネルに誰かがいる場合
                if (channel.members.size > 0) {
                    console.group(`Members in ${channel.name}:`);
                    channel.members.forEach(async member => {

                        joinnedUser.push(member.id);

                        const _user = dbUser.find(user => user.discord_id === member.id);
                        if (_user) {
                            console.log(`- ${member.user.tag} is in the database.`);

                            // 1. ユーザーが最後に参加した時間がnullもしくはlast_join_timeのほうが大きい場合、現在の時間をセット
                            if (_user.vc_last_join_time === null
                                || (
                                    _user.vc_last_leave_time
                                    && _user.vc_last_join_time
                                    && _user.vc_last_join_time < _user.vc_last_leave_time
                                )
                            ) {
                                await prisma.user.update({
                                    where: {
                                        discord_id: _user.discord_id
                                    },
                                    data: {
                                        discord_name: member.user.tag + (member.user.bot ? ' [BOT]' : ''),
                                        discord_avatar: member.user.avatarURL() ?? null,
                                        vc_last_join_time: new Date(),
                                        guild_joined_date: member.joinedAt ?? null,
                                    }
                                });
                                // 2. ユーザーが最後に参加したチャンネルが現在のチャンネルと異なる場合、退席処理の後入室処理をする
                            } else if (
                                _user.vc_last_join_time && _user.vc_last_leave_time
                                && _user.vc_last_join_time < new Date()
                                && _user.vc_last_join_time > _user.vc_last_leave_time
                                && _user.vc_last_join_channel !== channel.id
                            ) {
                                await prisma.user.update({
                                    where: {
                                        discord_id: _user.discord_id
                                    },
                                    data: {
                                        discord_name: member.user.tag + (member.user.bot ? ' [BOT]' : ''),
                                        discord_avatar: member.user.avatarURL() ?? null,
                                        vc_last_join_time: new Date(),
                                        vc_last_join_channel: channel.id,
                                        vc_last_leave_time: new Date(Date.now() - 1000),
                                        vc_total_sec: (_user.vc_total_sec ?? 0) + Math.floor((new Date().getTime() - _user.vc_last_join_time.getTime()) / 1000),
                                        guild_joined_date: member.joinedAt ?? null,
                                    }
                                });
                            }
                        // VCに入っているのにデータベースにない場合、データベースに追加
                        } else {
                            await prisma.user.create({
                                data: {
                                    discord_id: member.id,
                                    discord_name: member.user.tag + (member.user.bot ? ' [BOT]' : ''),
                                    discord_avatar: member.user.avatarURL() ?? null,
                                    vc_last_join_time: new Date(),
                                    vc_last_join_channel: channel.id,
                                    guild_joined_date: member.joinedAt ?? null,
                                }
                            });
                            console.log(`- ${member.user.tag} is not in the database.`);
                            // それ以外は何もしない
                        }
                    });
                    console.groupEnd();
                }
            }
        });

        console.log(joinnedUser)

        // 3. ユーザーが最後に退出した時間よりも最後に参加した時間が新しいのに、VCに参加していない場合、最後に退出した時間を現在の時間にセット
        dbUser.forEach(async user => {
            if (
                (
                    user.vc_last_join_time
                    && user.vc_last_leave_time
                    && user.vc_last_join_time > user.vc_last_leave_time
                    && !joinnedUser.includes(user.discord_id)
                ) || (
                    user.vc_last_join_time && !user.vc_last_leave_time
                )
            ) {
                await prisma.user.update({
                    where: {
                        discord_id: user.discord_id
                    },
                    data: {
                        vc_last_leave_time: new Date(),
                        vc_total_sec: (user.vc_total_sec ?? 0) + Math.floor((new Date().getTime() - user.vc_last_join_time.getTime()) / 1000),
                    }
                });
            }
        });
    });
}