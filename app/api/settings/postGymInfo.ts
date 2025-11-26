"use server";
import { prisma } from '@/lib/prisma';

export const postGymInfo = async (data: {
  name: string;
  email: string;
  phone: string;
  address: string;
}) => {
  const existingGym = await prisma.gym.findFirst();

  if (existingGym) {
    // Update existing gym info
    const updatedGym = await prisma.gym.update({
      where: { id: existingGym.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
    return {ok: true, gym: updatedGym};
  } else {
    // Create new gym info
    const newGym = await prisma.gym.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
    return {ok: true, gym: newGym};
  }
};