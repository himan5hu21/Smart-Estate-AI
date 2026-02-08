import { Card, CardContent, CardHeader, CardTitle } from "@/ui/Card"
import { cn } from "@/lib/utils"

interface TableProps {
  headers: string[]
  children: React.ReactNode
  title?: string
  className?: string
}

export function Table({ headers, children, title, className }: TableProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b bg-slate-50">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {headers.map((header) => (
                <th
                  key={header}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {children}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function TableRow({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-foreground", className)}>
      {children}
    </tr>
  )
}

export function TableCell({ children, className, ...props }: { children: React.ReactNode, className?: string } & React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props}>
      {children}
    </td>
  )
}
