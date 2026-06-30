"use client";
import {redirect, useParams} from "next/navigation";

export default function MemberIndex() {
    const params = useParams();

    return redirect(`./${params.id}/details`);
}