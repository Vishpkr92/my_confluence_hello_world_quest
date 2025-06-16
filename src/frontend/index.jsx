import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Text,
  Heading,
  Lozenge,
  Stack,
  useProductContext
} from '@forge/react';
import { invoke, view, requestConfluence } from '@forge/bridge';
import { token } from '@atlaskit/tokens';

// Fetch footer comments
const fetchCommentsForPage = async (pageId) => {
  const res = await requestConfluence(`/wiki/api/v2/pages/${pageId}/footer-comments`);
  const data = await res.json();
  return data.results;
};

// Fetch page metadata for last updated info
const fetchPageMetadata = async (pageId) => {
  const res = await requestConfluence(`/wiki/rest/api/content/${pageId}?expand=version`);
  const data = await res.json();
  return data;
};

const App = () => {
  const context = useProductContext();
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [name, setName] = useState(null);
  const [comments, setComments] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [spaceName, setSpaceName] = useState('this space');

  // Theme and account ID
  useEffect(() => {
    const getTheme = async () => {
      const ctx = await view.getContext();
      setTheme(ctx.theme.colorMode);
      setAccountID(ctx.accountId);

      // Capture space name if available
      const space = ctx?.extension?.space;
      if (space?.name) {
        setSpaceName(space.name);
      }
    };
    getTheme();
  }, []);

  // Fetch public name
  useEffect(() => {
    if (accountID) {
      const getUserInfo = async () => {
        const bodyData = JSON.stringify({ accountIds: [accountID] });
        const response = await requestConfluence(`/wiki/api/v2/users-bulk`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: bodyData
        });

        if (response.status === 200) {
          const userData = await response.json();
          setName(userData.results[0].publicName);
        }
      };
      getUserInfo();
    }
  }, [accountID]);

  
  
  // Custom resolver text with dynamic spaceName
  useEffect(() => {
  if (spaceName) {
    invoke('getText', { spaceName }).then(setData);
  }
}, [spaceName]);


  // Fetch comments and metadata
  useEffect(() => {
    const pageId = context?.extension?.content?.id;
    if (pageId) {
      fetchCommentsForPage(pageId).then(setComments);
      fetchPageMetadata(pageId).then((meta) =>
        setLastUpdated(meta.version?.when || null)
      );
    }
  }, [context]);

  if (!theme) return <Text>Loading theme...</Text>;

  const backgroundColor =
    theme === 'dark'
      ? token('color.background.discovery.bold')
      : token('color.background.input');

  const textColor =
    theme === 'dark' ? token('color.text.inverse') : token('color.text');

  return (
    <Stack
      space="large"
      style={{
        backgroundColor,
        color: textColor,
        padding: '24px',
        borderRadius: '8px',
        minHeight: '100vh'
      }}
    >
      <Heading size="xlarge">Hello {name || 'World'}!</Heading>
      <Heading
  	size="xlarge"
  	style={{ color: token('color.text.brand.bold') }}
      >Hello World!</Heading>
      <Text
  	style={{
    	fontSize: '32px',
    	fontWeight: 'bold',
    	color: token('color.text.accent.blue')
  	}}
	>
  	Hello World!
	</Text>

      <Text>{data || 'Loading content...'}</Text>
      <Text>Welcome to the {spaceName} space!</Text>

      <Text>
        Current theme:{' '}
        <Lozenge appearance={theme === 'dark' ? 'removed' : 'success'}>
          {theme}
        </Lozenge>
      </Text>

      <Heading size="medium">Page Engagement</Heading>
      <Text>
        {comments.length > 0
          ? `Number of footer comments: ${comments.length}`
          : 'No comments yet — be the first to leave one!'}
      </Text>

      {comments.slice(0, 3).map((comment, idx) => (
        <Text key={idx} style={{ fontStyle: 'italic' }}>
          • {comment.body.plain?.value || '[No comment content]'}
        </Text>
      ))}

      <Text>
        {lastUpdated
          ? `Last updated: ${new Date(lastUpdated).toLocaleString()}`
          : 'Last updated info not available'}
      </Text>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
