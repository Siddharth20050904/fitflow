-- DropForeignKey
ALTER TABLE "StoreOrderItem" DROP CONSTRAINT "StoreOrderItem_productId_fkey";

-- AddForeignKey
ALTER TABLE "StoreOrderItem" ADD CONSTRAINT "StoreOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "StoreProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
