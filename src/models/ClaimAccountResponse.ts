import {User} from "@/models/User";
import {SessionToken} from "@/models/SessionToken";

export interface ClaimAccountResponse {
    user: User;
    sessionToken: SessionToken;
}