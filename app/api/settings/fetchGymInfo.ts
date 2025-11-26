"use server";
import { prisma } from '@/lib/prisma';

export async function fetchGymInfo() {
  const gym = await prisma.gym.findFirst();
  return gym;
}