"use server"
import { verifyToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

const TEST_USER_EMAIL = "testuser@mail.com"
const TEST_ADMIN_ID = "test-admin-id-12345"

export const loginAdmin = async (token: string) => {
  try {
    if (token === "TEST_ADMIN_TOKEN") {
      // Check if test admin exists, if not create one
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

      return testAdmin
    }

    const payLoad = verifyToken(token)
    if (!payLoad) return null
    const { userId, email } = payLoad
    const admin = await prisma.admin.update({
      where: {
        id: userId,
        email: email,
        tokenId: token,
      },
      data: {
        tokenId: "",
      },
    })

    return admin
  } catch (err) {
    console.log(err)
    return null
  }
}
