#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
链接验证工具 - 检查 Mega Menu 中的所有链接是否有效
"""

import os
import sys
import io
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BUILD_DIR = "multilang-build"

# 从 header-mega-menu.html 中提取的所有链接
LINKS_TO_CHECK = [
    # Tools - Calculators
    "/devices/ppi-calculator",
    "/devices/aspect-ratio-calculator",
    
    # Tools - Testing & Comparison
    "/devices/compare",
    "/devices/responsive-tester",
    
    # Tools - Reference
    "/devices/standard-resolutions",
    
    # Devices - Smartphones
    "/devices/iphone-viewport-sizes",
    "/devices/android-viewport-sizes",
    
    # Devices - Tablets
    "/devices/ipad-viewport-sizes",
    
    # Indexes
    "/",
    "/blog/",
    "/zh/",
]

def check_link(link):
    """检查链接对应的文件是否存在"""
    # 移除开头的 /
    path = link.lstrip('/')
    
    # 如果是目录，检查 index.html
    if path.endswith('/') or path == '':
        if path == '':
            file_path = Path(BUILD_DIR) / 'index.html'
        else:
            file_path = Path(BUILD_DIR) / path / 'index.html'
    else:
        # 尝试直接路径和 .html 后缀
        file_path = Path(BUILD_DIR) / f"{path}.html"
        if not file_path.exists():
            file_path = Path(BUILD_DIR) / path
    
    return file_path.exists(), file_path

def main():
    print("\n" + "="*60)
    print("🔍 Phase 0.2 链接验证工具")
    print("="*60 + "\n")
    
    if not os.path.exists(BUILD_DIR):
        print(f"❌ 错误: '{BUILD_DIR}' 目录不存在!")
        print(f"请先运行 'npm run build'")
        sys.exit(1)
    
    print(f"📂 检查目录: {os.path.abspath(BUILD_DIR)}")
    print(f"🔗 需要验证的链接数: {len(LINKS_TO_CHECK)}\n")
    
    valid_links = []
    invalid_links = []
    
    for link in LINKS_TO_CHECK:
        exists, file_path = check_link(link)
        if exists:
            print(f"✅ {link:50} → {file_path.name}")
            valid_links.append(link)
        else:
            print(f"❌ {link:50} → NOT FOUND: {file_path}")
            invalid_links.append(link)
    
    print("\n" + "="*60)
    print("📊 验证结果汇总")
    print("="*60 + "\n")
    
    print(f"✅ 有效链接: {len(valid_links)}/{len(LINKS_TO_CHECK)}")
    print(f"❌ 无效链接: {len(invalid_links)}/{len(LINKS_TO_CHECK)}")
    
    if invalid_links:
        print(f"\n⚠️  发现无效链接:")
        for link in invalid_links:
            print(f"   - {link}")
        print("\n❌ 验证失败! 请修复上述链接后再部署。")
        sys.exit(1)
    else:
        print("\n🎉 所有链接验证通过!")
        print("✅ 可以安全部署到生产环境。")
        sys.exit(0)

if __name__ == "__main__":
    main()
