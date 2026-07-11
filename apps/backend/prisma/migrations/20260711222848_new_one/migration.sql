-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DONE', 'PENDING');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'PENDING';
