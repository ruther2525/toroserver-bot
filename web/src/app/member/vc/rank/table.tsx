/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { Select, Switch, Table } from "@mantine/core";
import { useEffect, useState } from "react";

export default function RankTable({
    data,
}: {
    data: {
        discord_name: string | null;
        vc_total_sec: number | null;
        discord_avatar: string | null;
        vc_last_join_time: Date | null;
        vc_last_leave_time: Date | null;
        guild_joined_date: Date | null;
    }[];
}) {
    const [dataNowTime, dataNowTimeSet] = useState<{
        discord_name: string | null;
        vc_total_sec: number | null;
        vc_total_sec_string: string | null;
        vc_total_sec_per_join: number | null;
        discord_avatar: string | null;
        vc_last_join_time: Date | null;
        vc_last_leave_time: Date | null;
    }[]>([]);

    const [isShowTotalSecPerJoin, setIsShowTotalSecPerJoin] = useState(false);
    const [sortKey, setSortKey] = useState<"total_sec" | "total_sec_per_join">("total_sec");

    useEffect(() => {
        const interval = setInterval(() => {
            const nowTime = new Date();
            const dataNowTime = data.map((user, index) => {
                const joinTime = user.vc_last_join_time;
                const leaveTime = user.vc_last_leave_time;
                const isInVC = joinTime && (!leaveTime || joinTime.getTime() > leaveTime.getTime());

                if (!joinTime) {
                    return {
                        discord_name: isInVC ? user.discord_name + " (📢)" : user.discord_name,
                        vc_total_sec: 0,
                        vc_total_sec_string: "データなし",
                        vc_total_sec_per_join: null,
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
                        vc_total_sec: count,
                        vc_total_sec_string: sec_str,
                        vc_total_sec_per_join: isShowTotalSecPerJoin && user.guild_joined_date ? count / ((nowTime.getTime() - user.guild_joined_date.getTime()) / 1000) : null,
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
                        vc_total_sec: user.vc_total_sec ?? 0,
                        vc_total_sec_string: sec_str,
                        vc_total_sec_per_join: isShowTotalSecPerJoin && user.guild_joined_date ? (user.vc_total_sec ?? 0) / ((nowTime.getTime() - user.guild_joined_date.getTime()) / 1000) : null,
                        discord_avatar: user.discord_avatar,
                        vc_last_join_time: user.vc_last_join_time,
                        vc_last_leave_time: user.vc_last_leave_time,
                    };
                }

                return {
                    discord_name: user.discord_name,
                    vc_total_sec: 0,
                    vc_total_sec_string: "データなし",
                    vc_total_sec_per_join: null,
                    discord_avatar: user.discord_avatar,
                    vc_last_join_time: user.vc_last_join_time,
                    vc_last_leave_time: user.vc_last_leave_time,
                };
            });

            dataNowTimeSet(dataNowTime);
        }, 500);

        return () => clearInterval(interval);
    }, [data, isShowTotalSecPerJoin]);

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Switch label="VC参加時間/サーバー参加からの時間 を表示" onChange={e => setIsShowTotalSecPerJoin(e.currentTarget.checked)} />
                    <p style={{ color: "#b11b1b", fontSize: ".8rem" }}>(激重注意！)</p>
                </div>
                {isShowTotalSecPerJoin && (
                    <Select
                        data={[
                            { value: "total_sec", label: "累計VC参加時間" },
                            { value: "total_sec_per_join", label: "VC参加時間/サーバー参加からの時間" },
                        ]}
                        defaultValue={"total_sec"}
                        onChange={e => setSortKey((e ?? "total_sec") as "total_sec" | "total_sec_per_join")}
                    />
                )}
            </div>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>#</Table.Th>
                        <Table.Th>名前</Table.Th>
                        <Table.Th style={{ textAlign: "right" }}>累計VC参加時間</Table.Th>
                        {isShowTotalSecPerJoin && (
                            <Table.Th>TotalSec per Join</Table.Th>
                        )}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {dataNowTime.sort((a, b) => {
                        if (sortKey === "total_sec_per_join" && isShowTotalSecPerJoin) {
                            return (b.vc_total_sec_per_join ?? 0) - (a.vc_total_sec_per_join ?? 0);
                        } else if (sortKey === "total_sec") {
                            if (a.vc_total_sec && b.vc_total_sec) {
                                return b.vc_total_sec - a.vc_total_sec;
                            }
                            return 0;
                        } else {
                            return 0;
                        }
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
                                    } } />
                                    {user.discord_name}
                                </div>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "right" }}>{user.vc_total_sec_string}</Table.Td>
                            {isShowTotalSecPerJoin && (
                                <Table.Td>
                                    {user.vc_total_sec_per_join}
                                </Table.Td>
                            )}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </>
    );
}