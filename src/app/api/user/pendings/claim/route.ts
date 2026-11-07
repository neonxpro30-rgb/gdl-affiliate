import { NextResponse } from "next/server";

// The Upgrade Bonus claim flow ended with the LearnPeak relaunch.
// Pre-cutover pendings are settled under the old terms by a supervised
// settlement run; nothing is claimable (or cancellable) through the app.
export async function POST() {
    return NextResponse.json(
        {
            error: 'PROGRAM_ENDED',
            message: 'The Upgrade Bonus program has ended. Any bonus pending from before the relaunch will be settled under the old terms — it has not been cancelled.',
        },
        { status: 410 }
    );
}
