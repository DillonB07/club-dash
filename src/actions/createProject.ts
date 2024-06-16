"use server";
import { prisma } from "~/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function createProject(formData: FormData) {
  // Check if the user is authenticated
  const { userId } = auth();

  if (!userId) {
    throw new Error("You must be signed in to create a project");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const clubId = formData.get("club") as string;
  const link = formData.get("link") as string;
  const taskId = formData.get("task") as string;
  const gitRepo = formData.get("gitRepo") as string;

  if (clubId) {
    const club = await prisma.club.findUnique({
      where: {
        id: clubId,
      },
      include: {
        owner: true,
      },
    });

    if (!club) {
      throw new Error("Club not found");
    }
  }

  const newUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      projects: {
        create: {
          name,
          description,
          link,
          taskId,
          gitRepo,
        },
      },
    },
  });

  // Redirect the user to the dashboard
  return {
    redirect: {
      destination: `/user/${newUser.forename}`,
      permanent: false,
    },
  };
}
