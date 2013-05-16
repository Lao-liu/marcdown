<link href="public/css/marcdown.css" rel="stylesheet"></link>

# Marcdown

Converts [markdown](http://daringfireball.net/projects/markdown/) files to html.

As I am new to node { var well = new ish(); } , I find that I need to read the markdown file(s) that
are associated with a modules and/or libraries. While there are some pretty good native tools around
to edit markdown, I often work best in *zen mode*, as a minimalist, using a simple text editor
and a browser.

*Marcdown* simply wraps a few of the typical node modules to help me read, write and review markdown 
content (in a browser). And yes, I am aware that I could connect to GitHub and use the builtin editor
to do the same thing, but there are many time where I am not connected or not ready to commit.

## Show me the money

Marcdown can [generate a set of node modules reademe links](./packages.md) by using the dependencies 
listed in a projects [package.json](./package.json) file. It can also [scan all subdirectories](./subdirs.md) 
of a project to gather up all markdown .md files.

It is also a test bed for my own node(.js) experimentation.


