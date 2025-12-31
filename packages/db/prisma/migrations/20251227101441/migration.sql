-- CreateEnum
CREATE TYPE "NodeState" AS ENUM ('CONNECTED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "PinState" AS ENUM ('ON', 'OFF');

-- CreateEnum
CREATE TYPE "PlanState" AS ENUM ('DRAFT', 'SCHEDUAL', 'ACTIVE', 'STOPPED', 'PAUSED', 'DONE');

-- CreateEnum
CREATE TYPE "RuleState" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Node" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" "NodeState" NOT NULL DEFAULT 'DISCONNECTED',

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pin" (
    "id" SERIAL NOT NULL,
    "state" "PinState" NOT NULL,
    "name" TEXT,
    "nodeId" INTEGER NOT NULL,
    "hasRule" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" "RuleState" NOT NULL,
    "priority" INTEGER NOT NULL,
    "pinId" INTEGER NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" "PlanState" NOT NULL DEFAULT 'SCHEDUAL',
    "pinId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "toResume" BOOLEAN NOT NULL DEFAULT false,
    "toExtend" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RulesToOpenPins" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RulesToOpenPins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RulesToClosePins" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RulesToClosePins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_id_key" ON "Node"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Pin_id_key" ON "Pin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_id_key" ON "Rule"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_id_key" ON "Plan"("id");

-- CreateIndex
CREATE INDEX "_RulesToOpenPins_B_index" ON "_RulesToOpenPins"("B");

-- CreateIndex
CREATE INDEX "_RulesToClosePins_B_index" ON "_RulesToClosePins"("B");

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_pinId_fkey" FOREIGN KEY ("pinId") REFERENCES "Pin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_pinId_fkey" FOREIGN KEY ("pinId") REFERENCES "Pin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RulesToOpenPins" ADD CONSTRAINT "_RulesToOpenPins_A_fkey" FOREIGN KEY ("A") REFERENCES "Pin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RulesToOpenPins" ADD CONSTRAINT "_RulesToOpenPins_B_fkey" FOREIGN KEY ("B") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RulesToClosePins" ADD CONSTRAINT "_RulesToClosePins_A_fkey" FOREIGN KEY ("A") REFERENCES "Pin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RulesToClosePins" ADD CONSTRAINT "_RulesToClosePins_B_fkey" FOREIGN KEY ("B") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
