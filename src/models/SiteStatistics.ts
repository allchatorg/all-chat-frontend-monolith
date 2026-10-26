export interface SiteStatistics {
    generatedAt: string;
    presence: {online: number; active: number};
    messages: {total: number; last24h: number};
    uploads: {totalBytes: number; last24hBytes: number; storedBytes: number; storedFiles: number};
    rooms: {publicRooms: number; last24h: number; privateChats: number};
    accounts: {total: number; registered: number; guests: number; last24h: number};
    bans: {bannedUsers: number; issuedLast24h: number};
}

export type TrendPeriod = 'WEEK' | 'MONTH' | 'YEAR' | 'ALL';

export interface TrendTotals {
    messages: number;
    newAccounts: number;
    roomsCreated: number;
    uploadedBytes: number;
    bansIssued: number;
}

export type TrendMetric = keyof TrendTotals;

export interface TrendPoint extends TrendTotals {
    start: string;
}

export interface SiteTrends {
    period: TrendPeriod;
    bucket: 'DAY' | 'MONTH';
    zone: string;
    current: TrendTotals;
    // Null for ALL, which has no earlier period to compare with.
    previous: TrendTotals | null;
    points: TrendPoint[];
}
