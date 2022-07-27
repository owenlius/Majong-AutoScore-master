import numpy as np
import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['KaiTi']  # 指定默认字体
plt.rcParams['axes.unicode_minus'] = False  # 解决保存图像是负号'-'显示为方块的问题
plt.style.use('ggplot')  # 设置ggplot主题样式

# 原始数据集并获取数据集长度
results = [{"A": 68, "B": 91, "C": 83, "D": 83, "E": 47, "F": 82},
           {"A": 88, "B": 87, "C": 82, "D": 86, "E": 42, "F": 69},
           {"A": 58, "B": 55, "C": 70, "D": 67, "E": 86, "F": 77}]
data_length = len(results[0])

# 将极坐标根据数据长度进行等分，形成角度列表
angles = np.linspace(0, 2 * np.pi, data_length, endpoint=False)

# 分离属性字段和数据
labels = [key for key in results[0].keys()]
score = [[v for v in result.values()] for result in results]

angles = np.concatenate((angles, [angles[0]]))
labels = np.concatenate((labels, [labels[0]]))
score_Harry = np.concatenate((score[0], [score[0][0]]))
score_Son = np.concatenate((score[1], [score[1][0]]))
score_Tobi = np.concatenate((score[2], [score[2][0]]))

# 设置图形的大小
fig = plt.figure(figsize=(8, 6), dpi=100)

# 新建一个子图
ax = plt.subplot(111, polar=True)

# 绘制雷达图并填充颜色
ax.plot(angles, score_Harry, color='orange')
ax.fill(angles, score_Harry, 'y', alpha=0.4)
ax.plot(angles, score_Son, color='b')
ax.fill(angles, score_Son, 'cyan', alpha=0.4)
ax.plot(angles, score_Tobi, color='r')
ax.fill(angles, score_Tobi, 'salmon', alpha=0.4)

# 设置雷达图中每一项的标签显示
ax.set_thetagrids(angles * 180 / np.pi, labels, fontsize=15)

ax.set_theta_zero_location('E')  # 设置0度坐标轴起始位置，东西南北

ax.set_rlim(0, 100)  # 设置雷达图的坐标刻度范围

ax.set_rlabel_position(270)  # 设置雷达图的坐标值显示角度，相对于起始角度的偏移量
ax.set_title("mleague选手数据")
plt.legend(["A", "B", "C"], loc='lower left')

plt.show()