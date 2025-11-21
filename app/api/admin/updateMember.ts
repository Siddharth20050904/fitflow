"use server";

import { prisma } from "@/lib/prisma";

export async function updateMember(
    memberId: string,
    name: string,
    email: string,
    status: string,
    number: string,
    joinDate: string
) {
    try{
        const updatedMember = await prisma.member.update({
            where: { id: memberId },
            data: {
                name,
                email,
                status,
                phone: number,
                joinDate: new Date(joinDate),
            },
        });
        return { updatedMember, success: true, message: "Member updated successfully." };
    }catch{
        return { updatedMember: null, success: false, message: "Failed to update member." };
    }

}       