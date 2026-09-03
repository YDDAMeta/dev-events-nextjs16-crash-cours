import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event from "@/database/event.model";
import { IEvent } from "@/database";




// Shape of the route's dynamic params
interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;

        // Validate slug presence and type
        if (!slug || typeof slug !== "string" || slug.trim() === "") {
            return NextResponse.json(
                { message: "A valid event slug is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Query the event by slug
        const event = await Event.findOne({ slug }).lean<IEvent | null>();

        if (!event) {
            return NextResponse.json(
                { message: `No event found with slug "${slug}"` },
                { status: 404 }
            );
        }

        return NextResponse.json({ event }, { status: 200 });
    } catch (error) {
        console.error("Error fetching event by slug:", error);
        return NextResponse.json(
            {
                message: "Failed to fetch event",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}