#!/usr/bin/env python3
import sys, os, re, json
def main(asset_dir):
    errors=[]; warnings=[]
    for root, _, files in os.walk(asset_dir):
        for f in files:
            if " " in f or re.search(r"[\u3000\uff01-\uff5e]", f):
                errors.append(f"非法命名: {os.path.join(root,f)}")
            if f.lower().endswith(('.svg','.png','.ico','.icns')) and f[0].isupper():
                warnings.append(f"建议小写命名: {os.path.join(root,f)}")
    result={"errors":errors, "warnings":warnings, "passed": len([e for e in errors if '非法' in e])==0}
    print(json.dumps(result, ensure_ascii=False, indent=2))
if __name__=="__main__":
    main(sys.argv[1] if len(sys.argv)>1 else ".")
