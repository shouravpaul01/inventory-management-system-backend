import prisma from "../shared/prisma";
import {
  ActionType,
  ActionStatus,
  EntityType,
} from "@prisma/client";

interface ActionLogPayload {
  userId: string;

  entityType: EntityType;
  entityId: string;

  action: ActionType;
  status?: ActionStatus;

  description?: string;
  meta?: Record<string, any>;
}

export const createActionLogDB = async (payload: ActionLogPayload) => {
  return prisma.actionLog.create({
    data: payload,
  });
};
