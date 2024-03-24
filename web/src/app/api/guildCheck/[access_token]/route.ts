import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60 * 60;
export const dynamic = 'force-static';

export async function GET(
    request: NextRequest,
    { params }: { params: { access_token: string } }
) {
    const { access_token } = params;
    if (!access_token) {
        return NextResponse.json("Missing access_token", {
            status: 400,
        });
    }

    const response = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    }).then((res) => res.json());

    return NextResponse.json(response, {
        status: response?.message? 400 : 200,
    });
}