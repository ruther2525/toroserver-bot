/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { Table } from "@mantine/core";
import { VCChannel } from "@prisma/client";

export default function RankTable({
    data,
}: {
    data: VCChannel[];
}) {

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>名前</Table.Th>
                    <Table.Th>カテゴリー</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>最大同時接続数</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data.map((vc, index) => (
                    <Table.Tr key={vc.channel_id}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                            {vc.channel_name}
                        </Table.Td>
                        <Table.Td>{vc.category_name}</Table.Td>
                        <Table.Td style={{ textAlign: "right" }}>{vc.vc_total_member}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}