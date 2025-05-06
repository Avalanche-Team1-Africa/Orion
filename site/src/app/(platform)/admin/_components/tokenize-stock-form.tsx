"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconSwitch, IconFlagBitcoin } from "@tabler/icons-react";
import { useState } from "react";
import { createStockOnCardano } from "@/server-actions/creations/stocks";
import { Spinner } from "@/components/ui/spinner";

// Define the form schema with Zod
const stockFormSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol must be 10 characters or less")
    .toUpperCase(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or less"),
  totalShares: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().gt(0, "must be greater than 0")),
});

// Defines the form value type from the schema
type StockFormValues = z.infer<typeof stockFormSchema>;

// Default values for the form
const defaultValues: Partial<StockFormValues> = {
  symbol: "",
  name: "",
  totalShares: 0,
};

export const TokenizeStockForm = () => {
  // Initialize the form
  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Handle form submission
  async function onSubmit(data: StockFormValues) {
    setIsSubmitting(true);
    try {
      //TODO: Call Server Action/endpoint
      await createStockOnCardano(data);
      // Show success message
      toast.success(
        `Stock tokenized successfully:${data.name} (${data.symbol} on Cardano) has been added to the marketplace.`,
      );

      // Reset the form
      form.reset();
    } catch (error) {
      toast.error("Error:unable to tokenize the entry");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2 justify-self-center">
      <div className="mb-4 flex items-center gap-2">
        <IconSwitch className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Stock Tokenization on Cardano</h1>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tokenize New Stock</CardTitle>
          <CardDescription>
            Add a new Cardano version of a stock to the marketplace by filling out the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="AAPL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the stock ticker symbol (e.g., AAPL for Apple Inc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Apple Inc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the full name of the company
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Shares</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="enter the total number of shares"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The total number of shares available
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-semibold md:w-auto">
                {isSubmitting ? (
                  <Spinner className="mr-1 h-4 w-4 text-white" />
                ) : (
                  <IconFlagBitcoin className="mr-1 h-4 w-4" strokeWidth={2} />
                )}
                {isSubmitting ? "Tokenizing" : "Tokenize Stock"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
