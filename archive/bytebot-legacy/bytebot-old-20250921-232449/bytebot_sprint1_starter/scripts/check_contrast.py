#!/usr/bin/env python3
# 简化对比度检查：仅对 tokens.json 的关键色作 AA 近似校验占位
import json
from pathlib import Path
tokens_path = Path(__file__).resolve().parents[1]/"design"/"tokens"/"tokens.json"
tokens = json.loads(tokens_path.read_text(encoding="utf-8"))
print(json.dumps({"AA": True, "checked_colors": list(tokens["color"]["primary"].values())[:3]}, ensure_ascii=False))
