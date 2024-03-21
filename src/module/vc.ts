import prisma from "@/prisma";
import { Client } from "discord.js";

const VCChannels = [];

export const VC = (client: Client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        if (oldState.channelId === null) {
            console.log(`${newState.member?.user.tag} joined ${newState.channel?.name}`);
        } else if (newState.channelId === null) {
            console.log(`${oldState.member?.user.tag} left ${oldState.channel?.name}`);
        } else {
            console.log(`${oldState.member?.user.tag} moved from ${oldState.channel?.name} to ${newState.channel?.name}`);
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
                    channel.members.forEach(member => {
                        console.log(`- ${member.user.tag}`);

                        joinnedUser.push(member.id);
                        
                        const _user = dbUser.find(user => user.discord_id === member.id);
                        if (_user) {
                            console.log(`- User ${member.user.tag} is in the database.`);

                            // Botがダウンしてたときの回復動作
                            // 1. ユーザーが最後に参加した時間がnullの場合、現在の時間をセット
                            if (_user.vc_last_join_time === null
                                || (
                                    _user.vc_last_leave_time
                                    && _user.vc_last_join_time < _user.vc_last_leave_time
                                )
                            ) {
                                prisma.user.update({
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
                                prisma.user.update({
                                    where: {
                                        discord_id: _user.discord_id
                                    },
                                    data: {
                                        vc_last_join_time: new Date(),
                                        vc_last_join_channel: channel.id
                                    }
                                });
                            }
                            // それ以外は何もしない
                        }
                    });
                }
                console.groupEnd();
            }
        });

        // Botがダウンしてたときの回復動作2

        // 3. ユーザーが最後に退出した時間よりも最後に参加した時間が新しいのに、VCに参加していない場合、最後に退出した時間を現在の時間にセット
        dbUser.forEach(user => {
            if (user.vc_last_join_time
                && user.vc_last_leave_time
                && user.vc_last_join_time > user.vc_last_leave_time
                && !joinnedUser.includes(user.discord_id)
            ) {
                prisma.user.update({
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