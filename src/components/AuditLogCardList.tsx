import * as React from 'react';
import {AuditLogUnion} from "@/models/AuditLog";
import {Card, CardHeader} from './ui/card';
import {ScrollArea} from './ui/scroll-area';
import {AuditLogCard} from "@/components/AuditLogCard";

type AuditLogCardListProps = {
    logs: AuditLogUnion[];
    title?: string;
    height?: string;
    maxHeight?: string;
};

const AuditLogCardList: React.FC<AuditLogCardListProps> = ({logs, title, height = 'auto', maxHeight}) => {
    return (
        <Card className="glass-surface flex w-full flex-col overflow-hidden rounded-lg"
              style={{minHeight: height, maxHeight}}>
            {title && (
                <CardHeader className="border-b border-(--glass-border)">
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                </CardHeader>
            )}

            {logs.length > 0 ? (
                <ScrollArea className="flex-1">
                    <div className="flex flex-col gap-4 p-4">
                        {logs.map((log) => (
                            <AuditLogCard key={log.id} log={log}/>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
                    No audit logs found.
                </div>
            )}

        </Card>
    );
};

export default AuditLogCardList;
