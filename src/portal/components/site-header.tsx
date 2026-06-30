import {Separator} from "@ads/components/ui/separator"
import {SidebarTrigger} from "@ads/components/ui/sidebar"

interface SiteHeaderProps {
    title: string
    description?: string
    showGitHubLink?: boolean
}

export function SiteHeader({
                               title,
                               description,
                               actions,
                           }: SiteHeaderProps & { actions?: React.ReactNode }) {
    return (
        <header
            className="flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[var(--header-height)]">
            <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                </div>
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-base font-medium">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}