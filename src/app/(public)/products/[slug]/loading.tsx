import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="container-px py-10">
      <Skeleton className="h-4 w-72" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-32" />
          <div className="h-px w-full bg-border" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
