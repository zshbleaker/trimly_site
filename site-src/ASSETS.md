# Next 页面素材清单

来源：`site-src/templates/index.html` 里各区块的 Asset 说明。图片用 webp；Log 对比图宽 2400 px。

## 必需（按优先级）

### In Photos — 最花功夫
- 一个片段在 Photos 里的真实日期网格（拍摄当天，8–12 张相邻照片）+ 它的 Info 面板，iPhone 或 Mac 均可
- 一组"普通导出"的同样画面，用作对比

### Shoot Log
1. Photos 网格批量套 LUT 前后的对比（iPhone、Mac 各一组）
2. 每个相机品牌一张 Log 原片 + 对应调色后画面：Apple Log 2、DJI D-Log、GoPro GP-Log、Insta360 I-Log（2400 px 宽）
3. 一段录屏：主页 → 选视频 → Apply LUT → 打开 Photos

> 现在网格里的 `strip-01…18` 只是普通缩略图，由 CSS 滤镜模拟 Log 灰平效果；换成真实素材需要成对的 Log / 调色后画面。

### Find moments
- 一段 5–15 分钟的录像，包含人声、笑声、动物、屏幕文字
- 每种搜索对应的 Find Clips 截图

### How it works
- 3 段 iPhone 录屏或截图：导入面板（含各来源）、时间线（已标出片段）、导出面板

### Every device
- 同一个项目在四台设备上的截图；App Store 那套几乎够用
- Apple TV 编辑器那张要换成真实素材，不能用示意图

### Edit bay
- 一张干净的 Mac 编辑器截图，打开的文件来自 SMB 共享，最好是 HDR 素材

## 可选
- Keep rolling：5 段 3–4 秒循环短片，每个场景一段（其余复用 hero 素材）

## 不需要
- Hero：已有 `moment-summit` / `moment-zebra` / `moment-dance` 与 `strip-01…18`
- Privacy:不需要新素材
