"use server";
import { prisma } from "@/lib/prisma";

export const fetchMembers = async(adminId: string) => {
    try{
        const members = await prisma.member.findMany({
            where:{
                adminId: adminId,
                type: "MEMBER"
            },
            orderBy:{
                joinDate: "desc"
            }
        });

        return {ok: true, members: members, message: "Members Fetched Successfully"};
    }catch{
        return {ok: false, members: [], message: "Error Occured. Please try later!"};
    }
}