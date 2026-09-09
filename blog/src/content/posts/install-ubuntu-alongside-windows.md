---
title: "在 Windows 电脑上安装 Ubuntu 24.04 双系统"
description: "保留 Windows，使用 Rufus 安装 Ubuntu 24.04 LTS 的完整步骤，以及 BitLocker、磁盘分区和启动设置中的注意事项。"
pubDate: 2026-09-09
type: engineering
tags:
  - engineering
  - ubuntu
  - windows
  - dual-boot
draft: false
---

这篇文章记录如何在保留 Windows 的前提下，为电脑安装 Ubuntu 24.04 LTS，组成双系统。它适合使用 UEFI 启动的普通个人电脑，不讨论删除 Windows 后单独安装 Ubuntu，也不展开手动分区。

双系统安装会修改磁盘分区和启动项。开始前请完整备份重要文件，并确认自己能够找到 BitLocker 恢复密钥。只要安装器没有识别到 Windows，或者最终确认页上的磁盘变更与你的预期不一致，就先退出安装，不要凭感觉继续。

## 准备材料

你需要准备：

- 一个 8 GB 或更大的闲置 U 盘。制作启动盘会清空其中的所有内容。
- [Ubuntu 24.04 LTS 桌面镜像](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)。下载文件名通常类似 `ubuntu-24.04.x-desktop-amd64.iso`。
- [Rufus](https://rufus.ie/zh/)，用于在 Windows 中制作启动盘。
- 一份重要文件的完整备份。
- 电脑厂商针对当前机型提供的启动菜单或 BIOS/UEFI 说明。

Ubuntu 官方给出的最低可用存储空间是 25 GB，但这只够系统和少量软件。实际要分给 Ubuntu 多少空间，取决于你准备安装的软件、数据量，以及 Windows 还需要保留多少余量。

## 先处理 BitLocker

Windows 设备加密或 BitLocker 开启时，Ubuntu 安装器可能无法正确识别 Windows 的磁盘布局，也就无法提供安全的并存安装选项。

开始前先在 Windows 设置中搜索 `BitLocker` 或“设备加密”，检查相关磁盘的状态。同时打开 Microsoft 的[恢复密钥页面](https://support.microsoft.com/zh-cn/windows/%E6%9F%A5%E6%89%BE-bitlocker-%E6%81%A2%E5%A4%8D%E5%AF%86%E9%92%A5-6b71ad27-0b89-ea08-f143-056f5ab347d6)，确认能够从另一台设备访问本机的 48 位恢复密钥。保存时要核对恢复密钥 ID，不要只凭电脑名称判断。

如果 Ubuntu 安装器明确提示 BitLocker 阻止安装，请退出安装，回到 Windows 关闭 BitLocker，并等待解密完成后再试。关闭加密不能代替数据备份。工作单位或学校管理的电脑可能需要联系管理员处理。

## 在 Windows 中腾出未分配空间

这里直接使用 Windows 自带的“磁盘管理”，不需要先安装第三方分区软件。

1. 按 `Win + X`，打开“磁盘管理”。也可以在开始菜单中搜索“创建并格式化硬盘分区”。
2. 找到准备缩小的 Windows 数据卷。确认卷标、容量和所在磁盘，不要只看 `C:`、`D:` 这样的盘符。
3. 右键该卷，选择“压缩卷”。
4. 输入希望释放的容量。磁盘管理使用 MB 作为单位，例如约 200 GB 可以填写 `204800` MB。200 GB 只是示例，不是安装要求。
5. 操作完成后，磁盘末尾会出现一块“未分配”空间。保持它未分配，不要在 Windows 中新建卷，也不要格式化。

如果系统允许压缩的容量远小于磁盘剩余空间，通常是卷尾部存在分页文件、卷影副本等不可移动文件。不要为了追求某个固定容量反复使用不熟悉的分区工具。先参考 Microsoft 的[压缩基本卷说明](https://learn.microsoft.com/zh-cn/windows-server/storage/disk-management/shrink-a-basic-volume)，确认限制原因。

## 使用 Rufus 制作启动盘

1. 插入 U 盘并运行 Rufus。
2. 在“设备”中选择准备清空的 U 盘，再根据容量和名称复核一次。选错设备会清空其他磁盘。
3. 在“引导类型选择”中选中刚下载的 Ubuntu ISO。
4. 其余参数先保留 Rufus 自动给出的默认值，不要强行指定 FAT32 或 32 KB 簇大小。
5. 点击“开始”。如果 Rufus 询问写入模式，选择推荐的“ISO 镜像模式”。
6. 等待状态变为完成，再从 Windows 中安全弹出 U 盘。

Ubuntu 官方建议大多数电脑先使用 Rufus 的默认参数。如果制作出的 U 盘无法启动，并且你已确认电脑只使用现代 UEFI 模式，可以重新制作并选择 GPT 分区方案和 `UEFI (non CSM)` 目标系统。GPT 与 UEFI 必须和电脑当前的启动模式匹配，不要在不确定时盲目修改。

## 从 U 盘进入 Ubuntu 试用环境

1. 保持 U 盘连接，关闭电脑。
2. 开机后进入一次性启动菜单。`F12` 很常见，但不同品牌和机型也可能使用 `Esc`、`F2`、`F9` 或 `F10`。以开机提示或电脑厂商的说明为准。
3. 在启动菜单中选择 U 盘对应的 UEFI 启动项。它可能显示为 U 盘品牌、`UEFI: 设备名` 或 `EFI Boot`，名称并不固定。
4. 如果随后出现 Ubuntu 菜单，选择 `Try or Install Ubuntu` 或含义相同的选项。

进入 Ubuntu 桌面后，先不要急着安装。测试键盘、触控板或鼠标、Wi-Fi、声音和屏幕显示是否正常。确认基本硬件可用后，再从桌面打开 `Install Ubuntu`。不同小版本的图标位置和界面文字可能不同，不必照着固定位置寻找。

## 安装 Ubuntu，并保留 Windows

按照安装器提示选择语言、键盘布局和网络。到了磁盘设置或安装类型这一步，需要格外谨慎。

1. 确认安装器已经识别出 Windows。
2. 选择“与 Windows Boot Manager 共存安装 Ubuntu”或含义相同的并存安装选项。具体文字可能随安装器版本变化。
3. 如果界面要求选择目标磁盘或调整空间滑块，确认使用的是之前准备好的未分配空间，并给 Windows 保留足够容量。
4. 在最终确认页逐项检查将要创建、格式化或调整的分区。目标磁盘和分区变化都符合预期后再继续。

> **看到以下任一情况，请停止安装：** 安装器提示 BitLocker 或 Intel RST；安装器没有识别 Windows；界面没有提供并存安装选项；最终确认页显示将删除或格式化 Windows 分区。退出安装不会破坏现有系统，贸然继续则可能丢失数据。

不要选择“擦除磁盘并安装 Ubuntu”。这个选项会让 Ubuntu 使用所选的整块磁盘，不适合本文的双系统场景。手动分区并不一定会删除 Windows，但需要理解 EFI 系统分区、文件系统和挂载点，不建议第一次安装时靠试错完成。

接下来选择时区并创建账户。用户名建议使用英文字母。这里设置的密码既用于登录，也用于执行需要管理员权限的 `sudo` 操作，请妥善保存。

安装器可能会提供第三方驱动和媒体格式支持。有 NVIDIA 显卡或其他需要专有驱动的硬件时，可以勾选相应选项；也可以安装完成后通过 Ubuntu 的“附加驱动”工具处理。标准 Ubuntu 安装通常支持开启 Secure Boot，无需为了安装而预先关闭它。

## 完成安装和首次启动

安装结束后按提示重启。如果屏幕要求移除安装介质，拔出 U 盘，然后按 Enter。

正常情况下，电脑会进入 Ubuntu 的启动菜单，让你选择 Ubuntu 或 Windows。若电脑仍然直接进入 Windows，可以再次打开一次性启动菜单，选择 Ubuntu；确认 Ubuntu 能正常启动后，再按照电脑厂商的说明调整 UEFI 启动顺序。

第一次进入桌面后，建议先安装系统更新，再检查 Wi-Fi、声音、显卡和休眠等功能。如果选择了中文环境，可以在“设置”的“区域与语言”中添加或调整中文输入源。Ubuntu 通常使用 IBus 管理多语言输入，不需要在安装系统前决定具体方案。

## 参考资料

- [Ubuntu 24.04 LTS 桌面安装教程](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- [Ubuntu 安装时遇到 BitLocker](https://ubuntu.com/desktop/docs/en/latest/reference/bitlocker-during-ubuntu-installation/)
- [Microsoft：查找 BitLocker 恢复密钥](https://support.microsoft.com/zh-cn/windows/%E6%9F%A5%E6%89%BE-bitlocker-%E6%81%A2%E5%A4%8D%E5%AF%86%E9%92%A5-6b71ad27-0b89-ea08-f143-056f5ab347d6)
- [Microsoft：压缩基本卷](https://learn.microsoft.com/zh-cn/windows-server/storage/disk-management/shrink-a-basic-volume)
- [Rufus 官方 FAQ](https://github.com/pbatard/rufus/wiki/FAQ)
- [Ubuntu Secure Boot 说明](https://wiki.ubuntu.com/UEFI/SecureBoot)
