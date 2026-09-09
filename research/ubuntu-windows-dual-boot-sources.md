# Windows 与 Ubuntu 24.04 双系统：技术事实核查

核查日期：2026-09-09。范围限定为：在现有 Windows 电脑上保留 Windows，并安装 Ubuntu 24.04 LTS。以下只采用 Ubuntu/Canonical、Microsoft、Rufus 项目或设备厂商的一手资料。

## 可保留

### 准备 Ubuntu 镜像和 U 盘

- 可以继续使用 Ubuntu 24.04 LTS 作为教程目标版本，但下载链接应指向明确的 24.04 文档或版本页，不要把 Ubuntu 首页当前展示的“最新版 LTS”与 24.04 混为一谈。Ubuntu 的 24.04 安装文档明确以 24.04 LTS 为对象，并说明镜像文件名会是 `ubuntu-24.04.x-desktop-amd64.iso` 或类似名称。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- “至少 8 GB U 盘”可以保留。Ubuntu 24.04 文档给出的建议是 8 GB 或更大；安装电脑本身至少需要 25 GB 可用存储空间。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 必须保留“制作启动盘会清空 U 盘”和“核对 Rufus 中选中的设备”两条警告。Ubuntu 官方步骤明确说 U 盘会被擦除，并要求确认设备没有选错。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)

### 备份与恢复密钥

- 必须在任何分区调整和系统安装前备份重要文件；这既包括电脑内的数据，也包括启动 U 盘内原有的数据。Ubuntu 官方安装文档把两者都列为安装前要求。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 保留“事先找到 BitLocker 恢复密钥”的建议。Microsoft 说明恢复密钥是 48 位数字，可能保存在个人 Microsoft 帐户、工作/学校帐户、打印件或 U 盘中；个人帐户可从 `https://aka.ms/myrecoverykey` 查找。应按屏幕显示的恢复密钥 ID 匹配，而不是仅凭电脑名称猜测。[Microsoft：查找 BitLocker 恢复密钥](https://support.microsoft.com/en-us/windows/security/encryption/find-your-bitlocker-recovery-key)

### 安装介质与试用环境

- 可以保留用 Rufus 写入 Ubuntu ISO 的路线。Ubuntu 24.04 官方 Windows 步骤就是下载最新版 Rufus、选择 Ubuntu ISO、点击开始，并在 ISOHybrid 提示出现时选择 ISO Image mode。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 可以保留先进入试用环境检查鼠标、键盘、Wi-Fi、声音、显示等硬件的建议。Ubuntu 官方明确建议未列入认证硬件的设备先用 Try Ubuntu Desktop 检查兼容性，并说明可从试用桌面上的 Install Ubuntu 快捷方式返回安装器。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- `Try or Install Ubuntu` 可以作为“可能看到的启动菜单项”保留，但界面和措辞可能随镜像小版本、固件和启动路径变化，不应写成唯一固定画面。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 安装完成后按提示重启；出现移除安装介质的提示时拔出 U 盘，再按 Enter。此流程与 Ubuntu 24.04 官方步骤一致。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)

## 需要改写

### BitLocker

- 原稿“确保当前需要压缩的盘没有启用 BitLocker”范围过窄。Ubuntu 24.04 安装器若检测到 Windows BitLocker，可能无法读取磁盘结构，也就不能安全完成引导式并存安装；教程应要求先检查安装器提示，并对涉及 Windows/目标磁盘的加密按官方指引处理。若安装器提示 BitLocker 阻挡并存安装，应退出安装、回 Windows 关闭 BitLocker，等待解密完成后再继续。[Ubuntu：安装时遇到 BitLocker](https://ubuntu.com/desktop/docs/en/latest/reference/bitlocker-during-ubuntu-installation/)
- “跳过此步可能导致数据丢失”应改得更精确：BitLocker 开启时，24.04 的引导式安装器无法正确映射加密磁盘；强行选择擦除磁盘才会直接毁掉 Windows 数据。关闭 BitLocker 本身也不是备份的替代品。[Ubuntu：安装时遇到 BitLocker](https://ubuntu.com/desktop/docs/en/latest/reference/bitlocker-during-ubuntu-installation/)
- 恢复密钥不要只写“拍照保存”。更稳妥的写法是：确认能从另一台设备访问密钥，记录恢复密钥 ID，并将密钥离线安全保存；组织管理的电脑可能需要联系 IT。Microsoft 明确表示无法替用户恢复、提供或重建丢失的密钥。[Microsoft：查找 BitLocker 恢复密钥](https://support.microsoft.com/en-us/windows/security/encryption/find-your-bitlocker-recovery-key)

### 压缩卷与未分配空间

- 建议把第三方 DiskGenius 主流程改成 Windows 自带“磁盘管理”：管理员进入磁盘管理，右键目标 NTFS 基本卷，选择“压缩卷”，输入希望释放的容量。Microsoft 说明该操作从卷尾部创建相邻的未分配空间，普通文件会自动移动，无需重新格式化；分页文件、卷影副本等不可移动文件会限制可压缩容量。[Microsoft：压缩基本卷](https://learn.microsoft.com/en-us/windows-server/storage/disk-management/shrink-a-basic-volume)
- “固定分出 200 GB”应改成示例而非硬性要求。Ubuntu 官方最低可用空间是 25 GB，实际应按软件、开发数据和 Windows 剩余空间决定；压缩前还应确认 Windows 分区自身留有充足余量。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 压缩完成后的区域应保持“未分配”，不要在 Windows 中新建简单卷或格式化。Microsoft 的磁盘管理文档区分了未分配空间与新建/格式化卷；Ubuntu 安装器需要可用于安装的空间。[Microsoft：Windows 磁盘管理](https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/disk-management-in-windows)
- 第三方工具可降级为“Windows 自带工具无法压缩到需要大小时再查原因或另行处理”，不宜作为新手默认方案。Microsoft 说明不可移动文件可能限制压缩，并给出了检查事件 ID 259 等诊断路线。[Microsoft：压缩基本卷](https://learn.microsoft.com/en-us/windows-server/storage/disk-management/shrink-a-basic-volume)

### Rufus 参数

- 不应要求所有人一开始就手动固定为“GPT + UEFI”。Ubuntu 24.04 官方建议 Rufus 大多数选项保持默认；仅当启动失败、且电脑是禁用 Legacy/CSM 的现代 UEFI 系统时，再把分区方案改为 GPT，并确认目标系统为 UEFI (non CSM)。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 若确实选择 GPT，必须明确这会制作“仅 UEFI 模式启动”的介质；它不适用于只支持传统 BIOS 或当前以 Legacy/CSM 模式启动的机器。Rufus 官方 FAQ 要求设置与目标电脑的 BIOS/UEFI 模式匹配。[Rufus 官方 FAQ](https://github.com/pbatard/rufus/wiki/FAQ)
- “文件系统 FAT32、簇大小 32 KB”应改为“保持 Rufus 自动选择的默认值”。Ubuntu 官方没有要求手动设定文件系统或簇大小；不同 ISO/Rufus 版本可根据镜像内容选择合适参数。手动固定这些值只会增加过时或不兼容风险。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- ISOHybrid 提示出现时选择 ISO Image mode 是正确的默认指引。Rufus 官方也解释其默认推荐 ISO 模式，但仍保留 DD 模式作为替代；文章无需把 DD 模式描述成错误。[Rufus 官方 FAQ](https://github.com/pbatard/rufus/wiki/FAQ)

### 启动菜单快捷键

- `F12` 应写成“常见按键”，不能写成通用固定键。Ubuntu 官方列出 `F12` 最常见，同时 `Esc`、`F2`、`F10` 也常见，并建议查看开机提示或设备厂商文档。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 可以给厂商例子，但要标明以具体机型说明书为准。例如 Dell 官方文档中 F12 是一次性启动菜单、F2 是 BIOS 设置；这只能证明 Dell 该系列/常见设计，不能推广到所有品牌。[Dell 官方手册示例](https://dl.dell.com/topicspdf/latitude-14-5480-laptop_owners-manual_th-th.pdf)
- 启动项名称也不固定，可能显示 U 盘品牌、`UEFI: <设备名>` 或 `EFI Boot`；不要承诺一定同时出现名为 `Windows bootloader` 的条目。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)

### “与 Windows 共存”安装选项

- `Install Ubuntu alongside Windows Boot Manager` 应写成“确认安装器已识别 Windows，并选择与现有系统并存的选项（文案可能略有差异）”。Ubuntu 官方说明：只有检测到其他操作系统时才会出现额外的 alongside 选项；因此不能保证所有电脑必然显示这一固定英文字符串。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 原稿“安装器会自动识别刚才压缩出的 200 GB 未分配空间，无需手动操作任何分区”过于绝对。官方的并存界面可能让用户选择安装目标磁盘，并用滑块分配空间；实际显示取决于磁盘布局。应要求在最终确认页核对目标磁盘和分区变更，若没有并存选项则停止，不要猜选手动分区。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- “擦除磁盘并安装 Ubuntu”会让 Ubuntu 占用所选整块磁盘；对本文的保留 Windows 场景必须明确禁止。若电脑有多个物理磁盘，仍必须逐项核对所选磁盘，不能仅凭盘符判断。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)

### Secure Boot 与驱动

- 不要把“关闭 Secure Boot”写成通用前置步骤。Ubuntu 的 Microsoft 签名 shim、Canonical 签名 GRUB 和官方内核支持常见 UEFI Secure Boot 配置，标准安装通常可在 Secure Boot 开启时启动。[Ubuntu Secure Boot 说明](https://wiki.ubuntu.com/UEFI/SecureBoot)
- 安装器里的“安装第三方软件/驱动”可作为可选项，但“会下载英伟达驱动”不能写成对所有机器必然发生。更准确的是：有 NVIDIA GPU 或其他需要专有驱动的硬件时，可以让安装器安装第三方驱动，或安装后使用“Additional Drivers”；Ubuntu 推荐使用其仓库提供的签名 NVIDIA 驱动以兼容 Secure Boot。[Ubuntu：安装 NVIDIA 驱动](https://ubuntu.com/desktop/docs/en/latest/how-to/graphics/install-nvidia-drivers/)
- 自行从 Ubuntu 指引之外下载的 NVIDIA 驱动可能覆盖 Ubuntu 包并破坏 Secure Boot；不应鼓励新手从 NVIDIA 网站直接下载安装包。[Ubuntu：安装 NVIDIA 驱动](https://ubuntu.com/desktop/docs/en/latest/how-to/graphics/install-nvidia-drivers/)

### 首次启动和中文输入法

- “以后每次都按 F12 选择 Ubuntu”应改成故障兜底，而非正常流程。Ubuntu 安装会创建自己的 UEFI BootEntry；正常情况下固件/GRUB 会按启动顺序进入 Ubuntu 或提供系统选择。若机器仍直接进 Windows，再用一次性启动菜单选择 Ubuntu，或在固件设置中调整启动顺序。[Ubuntu Secure Boot 说明](https://wiki.ubuntu.com/UEFI/SecureBoot)
- “没有好用的中文输入法，使用默认 ibus 就行”是主观且不准确的。应改成中性操作说明：选择中文安装时会随语言支持安装相关字体和输入法组件；之后可在“设置 → 区域与语言”或“语言支持”中添加/管理输入源。Ubuntu 官方说明语言支持组件可能包括字体、词典和输入法。[Ubuntu：安装语言支持](https://help.ubuntu.com/stable/ubuntu-help/prefs-language-install.html.en)
- 如需提及 IBus，应把它称为 Ubuntu 常用的多语言输入法框架，并说明拼音等引擎按安装情况添加，而不是评价其“好不好用”。[Ubuntu Community Help：IBus](https://help.ubuntu.com/community/ibus)

## 必须删除或避免

- 删除“Ubuntu 24.04 镜像约 7 GB”这种易过时的精确体积。点版本和镜像体积会变化；只需提醒准备 8 GB 或更大 U 盘，并从官方 24.04 页面下载对应架构镜像。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 删除把第三方“硬盘精灵/DiskGenius”设为唯一压缩工具的做法。文章若保留它，必须额外承担第三方版本差异和操作风险的核查；对新手教程，Windows 自带磁盘管理已有官方可验证流程。[Microsoft：压缩基本卷](https://learn.microsoft.com/en-us/windows-server/storage/disk-management/shrink-a-basic-volume)
- 删除固定要求 `FAT32` 和 `32 KB` 簇大小；改为保留 Rufus 默认值。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 避免声称 `F12` 适用于所有电脑，或启动菜单一定显示某个固定名称。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 避免承诺一定出现 `Install Ubuntu alongside Windows Boot Manager`。如果没有识别到 Windows/没有并存选项，教程应明确要求退出安装、回 Windows 复核 BitLocker、磁盘布局与启动模式，而不是让新手进入手动分区试错。[Ubuntu：安装时遇到 BitLocker](https://ubuntu.com/desktop/docs/en/latest/reference/bitlocker-during-ubuntu-installation/)
- 对本文目标必须明确避开 `Erase disk and install Ubuntu`，也不要笼统地说“其他选项都会删除 Windows”；真正需要避免的是擦除磁盘，手动分区并非必然删除 Windows，但不适合本文面向的新手流程。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
- 避免建议为了安装 Ubuntu 默认关闭 Secure Boot；只有遇到明确的设备/驱动兼容问题并查阅对应硬件文档后再处理。[Ubuntu Secure Boot 说明](https://wiki.ubuntu.com/UEFI/SecureBoot)
- 删除对中文输入法“没有好用的”这一主观断言，替换为可执行的语言支持与输入源设置说明。[Ubuntu：安装语言支持](https://help.ubuntu.com/stable/ubuntu-help/prefs-language-install.html.en)

## 建议成稿中的安全停止条件

1. 没有完成重要数据备份，或无法确认 BitLocker 恢复密钥可用：停止。
2. Rufus 中无法确认目标设备就是准备清空的 U 盘：停止。
3. Ubuntu 安装器提示 BitLocker 或 Intel RST 阻挡安装：退出安装，按 Ubuntu 对应官方指引回 Windows 处理，不要直接擦盘。本文虽未展开 RST，但 Ubuntu 24.04 安装文档把它列为独立前置问题。[Ubuntu 24.04 安装文档](https://ubuntu.com/desktop/docs/en/24.04/tutorial/install-ubuntu-desktop/)
4. 安装器没有识别 Windows，或没有出现并存选项：停止，不要选择擦除磁盘，也不要在不理解现有 EFI/恢复分区的情况下手动分区。
5. 最终确认页显示将格式化/删除 Windows 分区，或目标磁盘与预期不一致：返回或退出。

