import prisma from "@/prisma";
import { Client } from "discord.js";

const VCChannels = [];

export const VC = (client: Client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        if (oldState.channelId === null && newState.channelId !== null) {
            console.log(`${newState.member?.user.tag} joined ${newState.channel?.name}`);

            const _user = await prisma.user.findFirst({
                where: {
                    discord_id: newState.member?.id
                }
            });

            if (_user) {
                await prisma.user.update({
                    where: {
                        discord_id: _user.discord_id
                    },
                    data: {
                        vc_last_join_time: new Date(),
                        vc_last_join_channel: newState.channelId
                    }
                });
                console.log(`- User ${newState.member?.user.tag} is in the database.`);
            } else if (newState.member) {
                await prisma.user.create({
                    data: {
                        discord_id: newState.member.id,
                        vc_last_join_time: new Date(),
                        vc_last_join_channel: newState.channelId
                    }
                });
                console.log(`- User ${newState.member?.user.tag} is not in the database.`);
            }
        } else if (newState.channelId === null && oldState.channelId !== null) {
            console.log(`${oldState.member?.user.tag} left ${oldState.channel?.name}`);

            const _user = await prisma.user.findFirst({
                where: {
                    discord_id: oldState.member?.id
                }
            });

            if (_user && _user.vc_last_join_time) {
                await prisma.user.update({
                    where: {
                        discord_id: _user.discord_id
                    },
                    data: {
                        vc_last_leave_time: new Date(),
                        vc_total_sec: (_user.vc_total_sec ?? 0) + Math.floor((new Date().getTime() - _user.vc_last_join_time.getTime()) / 1000)
                    }
                });
            }
        } else if (oldState.channelId !== null && newState.channelId !== null && oldState.channelId !== newState.channelId){
            console.log(`${oldState.member?.user.tag} moved from ${oldState.channel?.name} to ${newState.channel?.name}`);

            const _user = await prisma.user.findFirst({
                where: {
                    discord_id: oldState.member?.id
                }
            });

            if (_user && _user.vc_last_join_time && _user.vc_last_join_channel) {
                await prisma.user.update({
                    where: {
                        discord_id: _user.discord_id
                    },
                    data: {
                        vc_last_join_channel: newState.channelId,
                    }
                });
            }
        } else {
            if (oldState.serverMute !== newState.serverMute) {
                console.log(`${newState.member?.user.tag} changed serverMute to ${newState.serverMute}`);
            } else if (oldState.serverDeaf !== newState.serverDeaf) {
                console.log(`${newState.member?.user.tag} changed serverDeaf to ${newState.serverDeaf}`);
            } else if (oldState.selfMute !== newState.selfMute) {
                console.log(`${newState.member?.user.tag} changed selfMute to ${newState.selfMute}`);
            } else if (oldState.selfDeaf !== newState.selfDeaf) {
                console.log(`${newState.member?.user.tag} changed selfDeaf to ${newState.selfDeaf}`);
            } else if (oldState.selfVideo !== newState.selfVideo) {
                console.log(`${newState.member?.user.tag} changed selfVideo to ${newState.selfVideo}`);
            } else if (oldState.streaming !== newState.streaming) {
                console.log(`${newState.member?.user.tag} changed streaming to ${newState.streaming}`);
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
                console.group(`Found voice channel: ${channel.name}`);
                VCChannels.push(channel);
                if (channel.members.size > 0) {
                    console.log(`Members in ${channel.name}:`);
                    channel.members.forEach(async member => {

                        joinnedUser.push(member.id);

                        const _user = dbUser.find(user => user.discord_id === member.id);
                        if (_user) {
                            console.log(`- ${member.user.tag} is in the database.`);

                            // Botがダウンしてたときの回復動作
                            // 1. ユーザーが最後に参加した時間がnullの場合、現在の時間をセット
                            if (_user.vc_last_join_time === null
                                || (
                                    _user.vc_last_leave_time
                                    && _user.vc_last_join_time < _user.vc_last_leave_time
                                )
                            ) {
                                await prisma.user.update({
                                    where: {
                                        discord_id: _user.discord_id
                                    },
                                    data: {
                                        vc_last_join_time: new Date(),
                                    }
                                });
                            // 2. ユーザーが最後に参加したチャンネルが現在のチャンネルと異なる場合、現在の時間をセット&チャンネルidをセット
                            } else if (
                                _user.vc_last_join_time
                                && _user.vc_last_join_time < new Date()
                                && _user.vc_last_join_channel !== channel.id
                            ) {
                                await prisma.user.update({
                                    where: {
                                        discord_id: _user.discord_id
                                    },
                                    data: {
                                        vc_last_join_time: new Date(),
                                        vc_last_join_channel: channel.id
                                    }
                                });
                            }
                            // VCに入っているのにデータベースにない場合、データベースに追加
                        } else {
                            await prisma.user.create({
                                data: {
                                    discord_id: member.id,
                                    vc_last_join_time: new Date(),
                                    vc_last_join_channel: channel.id
                                }
                            });
                            console.log(`- ${member.user.tag} is not in the database.`);
                            // それ以外は何もしない
                        }
                    });
                }
                console.groupEnd();
            }
        });

        // Botがダウンしてたときの回復動作2

        // 3. ユーザーが最後に退出した時間よりも最後に参加した時間が新しいのに、VCに参加していない場合、最後に退出した時間を現在の時間にセット
        dbUser.forEach(async user => {
            if (user.vc_last_join_time
                && user.vc_last_leave_time
                && user.vc_last_join_time > user.vc_last_leave_time
                && !joinnedUser.includes(user.discord_id)
            ) {
                await prisma.user.update({
                    where: {
                        discord_id: user.discord_id
                    },
                    data: {
                        vc_last_leave_time: new Date(),
                        vc_total_sec: (user.vc_total_sec ?? 0) + Math.floor((new Date().getTime() - user.vc_last_join_time.getTime()) / 1000)
                    }
                });
            }
        });
    });
}