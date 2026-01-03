
import re

file_path = '/Users/moussandou/Epitech/Bingeki-V2/src/pages/WorkDetails.tsx'

def check_nesting():
    with open(file_path, 'r') as f:
        lines = f.readlines()

    stack = []
    
    # regex for tags
    # <tag ... > or </tag>
    # Ignore self-closing <tag ... />
    
    tag_re = re.compile(r'</?([a-zA-Z0-9\.]+)(?:\s[^>]*)?(/?)>')
    
    for i, line in enumerate(lines):
        # exclude comments (simple check)
        # multi-line comments are harder but let's assume valid formatted code
        
        pos = 0
        while pos < len(line):
            match = tag_re.search(line, pos)
            if not match:
                break
                
            full_tag = match.group(0)
            tag_name = match.group(1)
            is_self_closing = match.group(2) == '/'
            start_pos = match.start()
            
            pos = match.end()
            
            # Check if it's a closing tag
            is_closing_tag = full_tag.startswith('</')
            
            if is_self_closing:
                continue
                
            # Ignore void elements
            if tag_name.lower() in ['img', 'br', 'input', 'hr', 'link', 'meta']:
                continue
                
            if is_closing_tag:
                if not stack:
                    print(f"Error: Unexpected closing tag <{tag_name}> at line {i+1}")
                    return
                last = stack.pop()
                if last['tag'] != tag_name:
                    # Allow Layout to close Layout (case sensitive)
                    if last['tag'] != tag_name:
                         # Fragment check <> and </>
                         # This script regex expects name.
                         pass
                    print(f"Error: Mismatch closing <{tag_name}> at line {i+1}. Expected <{last['tag']}> from line {last['line']}")
                    # continue checking?
            else:
                stack.append({'tag': tag_name, 'line': i+1})

    if stack:
        print("Unclosed tags at EOF:")
        for s in stack:
            print(f"{s['tag']} at line {s['line']}")
    else:
        print("Structure seems balanced.")

check_nesting()
