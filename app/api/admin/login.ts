"use server"
import { verifyToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

export const loginAdmin = async(token : string)=>{
    try{
        const payLoad = verifyToken(token);
        if(!payLoad) return null;
        const {userId, email} = payLoad;
        const admin = prisma.admin.update({
            where:{
                id: userId,
                email: email,
                tokenId: token
            },
            data:{
                tokenId: ""
            }
        });

        return admin;
    }catch(err){
        console.log(err);
    }
}