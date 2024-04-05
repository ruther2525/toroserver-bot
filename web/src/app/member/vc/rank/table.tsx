/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { Table } from "@mantine/core";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function RankTable({
    data,
}: {
    data: {
        discord_name: string | null;
        vc_total_sec: number | null;
        discord_avatar: string | null;
        vc_last_join_time: Date | null;
        vc_last_leave_time: Date | null;
    }[];
    }) {
    const [dataNowTime, dataNowTimeSet] = useState<{
        discord_name: string | null;
        vc_total_sec: string | null;
        discord_avatar: string | null;
        vc_last_join_time: Date | null;
        vc_last_leave_time: Date | null;
    }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const dataNowTime = data.map((user, index) => {
                const nowTime = new Date();
                const joinTime = user.vc_last_join_time;
                const leaveTime = user.vc_last_leave_time;
                const isInVC = joinTime && (!leaveTime || joinTime.getTime() > leaveTime.getTime());

                if (!joinTime) {
                    return {
                        discord_name: isInVC ? user.discord_name + " (📢)" : user.discord_name,
                        vc_total_sec: "データなし",
                        discord_avatar: user.discord_avatar,
                        vc_last_join_time: user.vc_last_join_time,
                        vc_last_leave_time: user.vc_last_leave_time,
                    };
                } else if (
                    !leaveTime
                    || joinTime.getTime() > leaveTime.getTime()
                ) {
                    const count = Math.floor((nowTime.getTime() - joinTime.getTime()) / 1000) + (user.vc_total_sec ?? 0);

                    let sec_str = "";
                    if (count >= 604800) {
                        sec_str = Math.floor(count / 604800) + "週";
                    }
                    if (count >= 86400) {
                        sec_str += ( '0' + Math.floor(count % 604800 / 86400)).slice(-1) + "日";
                    }
                    if (count >= 3600) {
                        sec_str += ( '00' + Math.floor(count % 86400 / 3600)).slice(-2) + "時間";
                    }
                    if (count >= 60) {
                        sec_str += ( '00' + Math.floor(count % 3600 / 60)).slice(-2) + "分";
                    }
                    sec_str += ( '00' + Math.floor(count % 60)).slice(-2) + "秒";
                    return {
                        discord_name: isInVC ? user.discord_name + " (📢)" : user.discord_name,
                        vc_total_sec: sec_str,
                        discord_avatar: user.discord_avatar,
                        vc_last_join_time: user.vc_last_join_time,
                        vc_last_leave_time: user.vc_last_leave_time,
                    };
                } else if (joinTime.getTime() < leaveTime.getTime()) {
                    let sec_str = "";
                    if ((user.vc_total_sec ?? 0) >= 604800) {
                        sec_str = Math.floor((user.vc_total_sec ?? 0) / 604800) + "週";
                    }
                    if ((user.vc_total_sec ?? 0) >= 86400) {
                        sec_str += ( '0' + Math.floor((user.vc_total_sec ?? 0) % 604800 / 86400)).slice(-1) + "日";
                    }
                    if ((user.vc_total_sec ?? 0) >= 3600) {
                        sec_str += ( '00' + Math.floor((user.vc_total_sec ?? 0) % 86400 / 3600)).slice(-2) + "時間";
                    }
                    if ((user.vc_total_sec ?? 0) >= 60) {
                        sec_str += ( '00' + Math.floor((user.vc_total_sec ?? 0) % 3600 / 60)).slice(-2) + "分";
                    }
                    sec_str += ( '00' + Math.floor((user.vc_total_sec ?? 0) % 60)).slice(-2) + "秒";

                    return {
                        discord_name: user.discord_name,
                        vc_total_sec: sec_str,
                        discord_avatar: user.discord_avatar,
                        vc_last_join_time: user.vc_last_join_time,
                        vc_last_leave_time: user.vc_last_leave_time,
                    };
                }

                return {
                    discord_name: user.discord_name,
                    vc_total_sec: "データなし",
                    discord_avatar: user.discord_avatar,
                    vc_last_join_time: user.vc_last_join_time,
                    vc_last_leave_time: user.vc_last_leave_time,
                };
            });

            dataNowTimeSet(dataNowTime);
        }, 500);

        return () => clearInterval(interval);
    }, [data]);

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>名前</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>累計VC参加時間</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {dataNowTime.sort((a, b) => {
                    if (a.vc_total_sec && b.vc_total_sec) {
                        return Number(b.vc_total_sec.replace('秒', '')) - Number(a.vc_total_sec.replace('秒', ''));
                    }
                    return 0;
                }).map((user, index) => (
                    <Table.Tr key={index}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                            }}>
                                <img src={user.discord_avatar ?? ""} alt={user.discord_name + "'s icon"} width={20} height={20} onError={e => {
                                    e.currentTarget.src = "/toroserver-icon.png";
                                    e.currentTarget.onerror = null;
                                }} />
                                {user.discord_name}
                            </div>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right" }}>{user.vc_total_sec}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}