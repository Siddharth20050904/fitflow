"use server";
import { prisma } from "@/lib/prisma";

export const addMember = async(
    name: string,
    email: string,
    status: string,
    number: string,
    joining_date: Date,
    adminId: string
)=>{
    try{
        const addedMember = await prisma.member.create({
            data:{
                name,
                email,
                status,
                phone: number,
                joinDate: joining_date,
                type: "MEMBER",
                adminId
            }
        })

        return {ok: true, addedMember: addedMember, message: "Member Added Successfully"};
    }catch{
        return {ok: false, addedMember: null , message: "Error Occured. Please try later!"};
    }
}