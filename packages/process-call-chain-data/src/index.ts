import callChain from "../callChainData.json";
import callChain2 from "../callChainData2.json";

const callChains = [callChain, callChain2];

callChains.forEach((CC) => {
  let wpTime = 0;
  
  const firstEventStartTime = new Date(CC.events[0]!.startTime).getTime();
  const eventsWithoutInternalApis = CC.events.filter((e) => { 
    const hasInternal = e.metadata.find(({ key }) => key === "apiName")?.value.includes("internal");
    return !hasInternal;
  });
  const signingEndTime = new Date(
    eventsWithoutInternalApis[eventsWithoutInternalApis.length - 1]!.endTime
  ).getTime();

  const broadcastEndTime = new Date(
    CC.events[CC.events.length - 1]!.endTime
  ).getTime();
  const totalTime = signingEndTime - firstEventStartTime;
  const timeToBroadcast = broadcastEndTime - firstEventStartTime;
  
  CC.events.forEach((event) => {
    const duration =
      new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
    wpTime += duration;
    console.log(
      `
      API Name: ${event.metadata.find(({ key }) => key === "apiName")?.value}, 
      Request ID: ${event.metadata.find(({ key }) => key === "requestId")?.value}, 
      Trace ID: ${event.metadata.find(({ key }) => key === "traceId")?.value}, 
      DurationS: ${duration / 1000}`
    );
  });

  console.log(`wpTimeInSeconds: ${wpTime / 1000}`);
  console.log(`startToSignignEndInSeconds: ${totalTime / 1000}`);
  console.log(`startToBroadcastInSeconds: ${timeToBroadcast / 1000}`);
});


