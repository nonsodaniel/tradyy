import { NextRequest } from 'next/server';
import { getTopCryptos } from '@/lib/api/coingecko';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let running = true;

      req.signal.addEventListener('abort', () => {
        running = false;
        controller.close();
      });

      while (running) {
        try {
          const prices = await getTopCryptos(20, 'usd');
          const data = JSON.stringify({ type: 'prices', data: prices, ts: Date.now() });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // silently skip failed polls
        }

        await new Promise((r) => setTimeout(r, 30_000));
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
