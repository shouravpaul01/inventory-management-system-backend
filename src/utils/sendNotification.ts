import {  EntityType, NotificationType } from "@prisma/client";
import prisma from "../shared/prisma";



interface SendNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  entityType?: EntityType;
  entityId?: string;
}


export const sendNotification = async (
  payload: SendNotificationPayload
) => {
  return prisma.notification.create({
    data: payload
  });
};
