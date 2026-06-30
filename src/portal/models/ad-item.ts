export type AdApprovalState = "rejected" | "submitted" | "submitted" | "active" | "completed"

export interface AdItem {
    id: number
    title: string
    adType: "text" | "photo" | "video"
    viewsBought: number
    price: number
    totalPricePaid: number
    purchaseDate: string
    startDate: string
    approvalState: AdApprovalState
    username: string
    userId: string
}

export type AdType = "text" | "photo" | "video"