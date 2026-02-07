-- Add sort order to FAQs
ALTER TABLE "faqs" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;
