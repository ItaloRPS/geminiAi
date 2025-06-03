/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Login` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Login_userId_key" ON "Login"("userId");
