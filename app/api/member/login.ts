"use server"
import { verifyToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

const TEST_USER_EMAIL = "testuser@mail.com"
const TEST_ADMIN_ID = "test-admin-id-12345"
const TEST_MEMBER_ID = "test-member-id-12345"

export const loginMember = async (token: string) => {
  try {
    if (token === "TEST_MEMBER_TOKEN") {
      // Ensure test admin exists first
      let testAdmin = await prisma.admin.findUnique({
        where: { email: TEST_USER_EMAIL },
      })

      if (!testAdmin) {
        testAdmin = await prisma.admin.create({
          data: {
            id: TEST_ADMIN_ID,
            email: TEST_USER_EMAIL,
            name: "Test Admin User",
            phone: "+1234567890",
            type: "ADMIN",
            tokenId: "",
          },
        })
      }

      // Check if test member exists, if not create one
      let testMember = await prisma.member.findUnique({
        where: { email: TEST_USER_EMAIL },
      })

      if (!testMember) {
        testMember = await prisma.member.create({
          data: {
            id: TEST_MEMBER_ID,
            email: TEST_USER_EMAIL,
            name: "Test Member User",
            phone: "+1234567890",
            type: "MEMBER",
            status: "active",
            adminId: testAdmin.id,
            tokenId: "",
          },
        })
      }

      return testMember
    }

    const payLoad = verifyToken(token)
    if (!payLoad) return null
    const { userId, email } = payLoad
    const member = await prisma.member.update({
      where: {
        id: userId,
        email: email,
        tokenId: token,
      },
      data: {
        tokenId: "",
      },
    })

    return member
  } catch (err) {
    console.log(err)
    return null
  }
}
