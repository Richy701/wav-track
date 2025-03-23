import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const LONG_TEXT = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
`.repeat(3)

export default function ScrollDemo() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Scrollbar Variants</h1>
        <p className="text-muted-foreground">
          Different scrollbar styles that work in both light and dark modes.
        </p>

        {/* Default Scrollbar */}
        <Card>
          <CardHeader>
            <CardTitle>Default Scrollbar</CardTitle>
            <CardDescription>The standard scrollbar with a clean, modern design.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <div className="p-4">
                <p className="text-sm">{LONG_TEXT}</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Thin Scrollbar */}
        <Card>
          <CardHeader>
            <CardTitle>Thin Scrollbar</CardTitle>
            <CardDescription>A more subtle, thinner scrollbar variant.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea variant="thin" className="h-[300px] w-full rounded-md border">
              <div className="p-4">
                <p className="text-sm">{LONG_TEXT}</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Rounded Scrollbar */}
        <Card>
          <CardHeader>
            <CardTitle>Rounded Scrollbar</CardTitle>
            <CardDescription>A scrollbar with fully rounded corners.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea variant="rounded" className="h-[300px] w-full rounded-md border">
              <div className="p-4">
                <p className="text-sm">{LONG_TEXT}</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Auto-hiding Scrollbar */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-hiding Scrollbar</CardTitle>
            <CardDescription>
              A scrollbar that only appears when hovering over the content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea variant="hide" className="h-[300px] w-full rounded-md border">
              <div className="p-4">
                <p className="text-sm">{LONG_TEXT}</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Horizontal Scrolling */}
        <Card>
          <CardHeader>
            <CardTitle>Horizontal Scrolling</CardTitle>
            <CardDescription>Scrollbar for horizontal content.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea orientation="horizontal" className="w-full rounded-md border">
              <div className="flex p-4 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="w-[200px] shrink-0 rounded-md border p-4">
                    <div className="font-semibold">Card {i + 1}</div>
                    <p className="text-sm text-muted-foreground">Scrollable content card {i + 1}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
