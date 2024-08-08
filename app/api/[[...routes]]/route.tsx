/** @jsxImportSource frog/jsx */
import { getERC721Metadata } from '@/app/libs/ethereum';
import { getMetadata } from '@/app/service/externalApi';
import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { handle } from 'frog/next';
import { serveStatic } from 'frog/serve-static';

const app = new Frog({
  title: 'STE Frame',
  basePath: '/api', //root uri
});

app.frame('/view/:chain/:contract', async (c) => {
  const { chain, contract } = c.req.param();
  const { tokenId, imagePath, imagePostfix } = c.req.query();
  if (chain === ':chain' || contract === ':contract') {
    return c.res({
      image: (
        <div style={{ color: 'black', display: 'flex', fontSize: 60 }}>
          Error
        </div>
      ),
    });
  }
  const { actions, meta, name } = await getMetadata(
    Number(chain),
    contract as `0x${string}`
  );

  let metadata = null;
  if (tokenId) {
    metadata = await getERC721Metadata(
      Number(chain),
      contract as `0x${string}`,
      BigInt(tokenId)
    );
  }

  const intents =
    (actions || [])
      .slice(0, 3)
      .map((action) => (
        <Button.Link
          href={`https://viewer.tokenscript.org/?chain=${chain}&contract=${contract}#card=${action}`}
        >
          {action}
        </Button.Link>
      )) || [];
  ``;

  // Warpcast don't like the "." in the querystring, so we have to do the string concat to workaround it
  const customImage = imagePath
    ? imagePostfix
      ? `${imagePath}.${imagePostfix}`
      : imagePath
    : undefined;
  const imageUrl = metadata?.image || meta.imageUrl || customImage;

  return c.res({
    image: (
      <div style={{ color: 'black', display: 'flex', fontSize: 60 }}>
        {imageUrl ? (
          <img src={imageUrl} style={{ height: '100%' }} tw={`mx-auto`} />
        ) : (
          <div
            style={{
              margin: '0 auto',
              height: '532px',
              color: 'white',
              'font-size': '120px',
              display: 'flex',
              'align-items': 'center',
            }}
          >
            {name}
          </div>
        )}
      </div>
    ),
    intents: [
      ...intents,
      <Button.Link
        href={`https://viewer.tokenscript.org/?chain=${chain}&contract=${contract}`}
      >
        More
      </Button.Link>,
    ],
    title: metadata?.description || name || undefined
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
