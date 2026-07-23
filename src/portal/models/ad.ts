export enum AdStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
}

export enum AdFormatType {
    TEXT = "TEXT",
    PHOTO = "PHOTO",
    VIDEO = "VIDEO"
}

export interface Ad {
    id: number; // Assuming ID is part of the response based on typical patterns, though not explicitly in AdDto snippet, it's usually needed for frontend keys/actions. If strictly AdDto, it might be missing, but let's assume it's there or map it. Wait, the user provided AdDto doesn't have ID. Let's look at AdController? It returns Page<AdDto>. AdDto has no ID. This is problematic for React keys and actions. I should stick to the user's provided AdDto for now but I might need to ask or assume ID is present if I need it. actually, let's look at the previous MOCK_ADS, they had ID. The backend AdDto *should* probably have an ID. I'll add it as optional or check if I can add it. actually, looking at the user request: "this is how it looks in the frontend package... public class AdDto ...". It indeed has no ID. Accessing details might be hard without ID. However, the user said "this will be the data structure". I will implement it as requested.
    title: string;
    formatType: AdFormatType;
    viewsBought: number;
    price: number;
    submittedDate: string; // ISO string for LocalDateTime
    startDate: string; // ISO string for LocalDateTime
    email: string;
    userId: number;
    status: AdStatus;
}

// If the backend actually returns an ID, we should add it. For now I will follow the snippet strictly but maybe add an optional id if I suspect it's needed for the table.
// Actually, let's add `id?: number` just in case, or maybe the backend AdDto *does* have it and the snippet was truncated? No, "this is how it looks".
// Wait, the existing AdItem has `id`. If I remove it, the table keys will break.
// I will assume for now that the backend *will* provide an ID or I might have to use something else as key (maybe title + date?).
// Let's look at AdController. It returns `Page<AdDto>`.
// I will implement `Ad` interface based on `AdDto`.

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        pageNumber: number;
        pageSize: number;
        unpaged: boolean;
        paged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    empty: boolean; // Note: user snippet has `empty: boolean` at the end
}

export interface AdSearchRequest {
    status?: AdStatus;
    types?: AdFormatType[];
    page?: number;
    size?: number;
    sort?: string;
    userId?: number;
    email?: string;
    approvedAtStart?: string; // ISO date string for LocalDateTime
    approvedAtEnd?: string; // ISO date string for LocalDateTime
}

export interface AdStatusCount {
    status: AdStatus;
    count: number;
}

// Per-user summary shown in the staff ban form: counts by status plus the
// pending (PENDING + payment authorized) purchases a permanent ban refunds.
export interface BanAdsSummary {
    totalAds: number;
    pendingCount: number;
    activeCount: number;
    completedCount: number;
    rejectedCount: number;
    pendingRefundCount: number;
    pendingRefundTotal: number;
    currency: string;
}

export interface ServeAdRequest {
    userId?: number;
    ipAddress?: string;
}

export interface ServedAd {
    title: string;
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    format: AdFormatType;
}

export interface AdDailyStat {
    date: string; // ISO date string YYYY-MM-DD
    viewsCount: number;
    clicksCount: number;
    ctr: number; // fraction 0.0-1.0
}

export interface AdLinkDailyStat {
    date: string; // ISO date string YYYY-MM-DD
    clicksCount: number;
}

export interface AdLinkStat {
    url: string;
    totalClicks: number;
    todaysClicks: number;
    dailyStats: AdLinkDailyStat[];
}

export interface AdDailyStatsResponse {
    adId: number;
    viewsBought: number;
    servedViews: number;
    todaysViews: number;
    yesterdaysViews: number;
    totalClicks: number;
    todaysClicks: number;
    overallCtr: number; // fraction 0.0-1.0
    dailyStats: AdDailyStat[];
    // One entry per hyperlink in the ad's text, tracked separately from
    // photo/video clicks
    linkStats?: AdLinkStat[];
}

export interface UserAdViewsSummary {
    todaysViews: number;
    yesterdaysViews: number;
    totalViewsBought: number;
    totalServedViews: number;
    totalClicks: number;
    overallCtr: number; // fraction 0.0-1.0
}

export interface DailyViewStats {
    date: string; // ISO date string YYYY-MM-DD
    viewsCount: number;
}

export interface UserAdViewsDailyBreakdownDto {
    dailyViews: DailyViewStats[];
}

export interface DailyPurchaseCount {
    date: string; // ISO date string YYYY-MM-DD
    count: number;
}

export interface PurchasedAdsDailyCountDto {
    dailyCounts: DailyPurchaseCount[];
    totalCount: number;
}

export interface RevenueDto {
    todayRevenue: number;
    yesterdayRevenue: number;
}

export interface MonthlyRevenueDto {
    month: string;
    // Ad revenue only (historical receipts are all ads → backward compatible)
    revenue: number;
    // Promoted-messages revenue, reported as a separate series
    promotedRevenue: number;
}

export interface MonthlyRevenueResponseDto {
    data: MonthlyRevenueDto[];
}

export interface WeeklyRevenueDto {
    day: string;
    // Ad revenue only
    revenue: number;
    // Promoted-messages revenue, reported as a separate series
    promotedRevenue: number;
}

export interface WeeklyRevenueResponseDto {
    data: WeeklyRevenueDto[];
}
