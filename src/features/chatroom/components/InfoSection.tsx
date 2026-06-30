import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartScatter} from "lucide-react";
import {Badge} from "@/components/ui/badge";

const InfoSection = ({className = ""}) => {
    return (
        <Card className="flex h-full min-h-full w-full flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <ChartScatter className="h-5 w-5"/>
                    Advertiser Name
                    <Badge variant="secondary" className="ml-auto">
                        Your Ad Info Here
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className={`flex-1 p-0 ${className}`}>
                <div className="h-full overflow-hidden bg-red-50 pb-4 space-y-2">
                    <div className="mt-4 flex h-full w-full items-center justify-center overflow-hidden rounded">
                        <h3 className="">Your Ad Here</h3>

                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InfoSection;