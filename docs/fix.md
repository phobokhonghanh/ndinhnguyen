rate-params: 1244ms, application-code: 389ms)
[browser] A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

...
<RenderFromTemplateContext>
<ScrollAndMaybeFocusHandler cacheNode={{rsc:{...}, ...}}>
<InnerScrollAndFocusHandlerOld focusAndScrollRef={{scrollRef:null, ...}} cacheNode={{rsc:{...}, ...}}>
<ErrorBoundary errorComponent={undefined} errorStyles={undefined} errorScripts={undefined}>
<LoadingBoundary name="/" loading={null}>
<HTTPAccessFallbackBoundary notFound={{...}} forbidden={undefined} unauthorized={undefined}>
<HTTPAccessFallbackErrorBoundary pathname="/en/experi..." notFound={{...}} forbidden={undefined} ...>
<RedirectBoundary>
<RedirectErrorBoundary router={{...}}>
<InnerLayoutRouter url="/en/experi..." tree={[...]} params={{locale:"en"}} ...>
<SegmentViewNode type="layout" pagePath="[locale]/l...">
<SegmentTrieNode>
<link>
<LocaleLayout>
<html lang="en" suppressHydrationWarning={true}>
<body

-                               className="min-h-screen bg-background font-sans antialiased __variable_f367f3 __variab..."

*                               className="min-h-screen bg-background font-sans antialiased __variable_f367f3 __variab..."
*                               data-intersub-modeplugin="2001"
                              >
                      ...
          ...
