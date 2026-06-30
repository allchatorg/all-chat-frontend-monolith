"use client";
import {redirect, useParams} from "next/navigation";

export default function UserIndex() {
    const params = useParams();

    return redirect(`/portal/admin/users/${params.id}/details`);
}
