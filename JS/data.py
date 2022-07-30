import pandas as pd

file_list = ['log-2022-07-23.ini', 'log-2022-7-16.ini','log-2022-7-30.ini']

log_text = ''
for filename in file_list:
    with open(filename, 'rb') as f:
        log_text += f.read().decode('utf-8') + '\n'

log_text = log_text.replace('\xa0', ' ')
log_text = log_text.replace('\r\n', '\n')
log_text = log_text.replace('：', ':')
log_list_org = log_text.split('\n')

log_list = list(filter(lambda x: x != '', log_list_org))

log_list = list(filter(lambda x: x != 'log', log_list))

player_list = list(filter(lambda x: '东一局0本场' in x or '分数统计' in x, log_list))

player_result = []
for index, i in enumerate(player_list):
    if '东一局0本场' in i and index < len(player_list) - 1:
        player = player_list[index + 1]
        player = player[player.index('分数统计'):len(player)]
        player = player.split(':')
        player_result.append(player[1])
        player_result.append(player[3])
        player_result.append(player[5])
        player_result.append(player[7])

log_list = list(filter(lambda x: x[0:4] != '分数统计', log_list))

log_list = list(filter(lambda x: x[4:6] != '本场', log_list))

# i = len(log_list) - 1
# while i >= 0:
#     if log_list[i] == '撤回':
#         log_list.pop(i)
#         log_list.pop(i-1)
#         i -= 2
#     else:
#         i -= 1

dianpao_list = list(filter(lambda x: '点炮' in x, log_list))

dianpao_result = []
for i in dianpao_list:
    pao_player = i[0:i.index('点炮')-1]
    rong_player = i[i.index('点炮')+4:i.index('得到')-1]
    point = int(i[i.index('得到')+3:i.index('0 点')+1])
    dianpao_result.append([pao_player, rong_player, point])

zimo_list = list(filter(lambda x: '自摸' in x, log_list))

zimo_result = []
for i in zimo_list:
    zimo = i.split(' ')
    zimo_index = 0
    for index, j in enumerate(zimo):
        if '自摸' in j:
            zimo_index = index
    zimo_player = zimo[zimo_index-1]
    lost_list = list(filter(lambda x: '失去' in x, zimo))
    lost_list = [int(i[2:len(i)]) for i in lost_list]
    point = sum(lost_list)
    zimo_result.append([zimo_player, point])

df_dianpao = pd.DataFrame(dianpao_result, columns=['点炮', '荣和', '点数'])
df_pao = df_dianpao.groupby('点炮').count()['点数'].reset_index().rename(columns={'点炮': '选手', '点数': '点炮数'})
df_pao_point = df_dianpao.groupby('点炮').mean()['点数'].reset_index().rename(columns={'点炮': '选手', '点数': '平均铳点'})
df_rong = df_dianpao.groupby('荣和').count()['点数'].reset_index().rename(columns={'荣和': '选手', '点数': '荣和数'})
df_rong_list = df_dianpao.groupby('荣和').sum()['点数'].reset_index().rename(columns={'荣和': '选手', '点数': '荣和点数'})

df_zimo = pd.DataFrame(zimo_result, columns=['选手', '点数'])
df_mo = df_zimo.groupby('选手').count()['点数'].reset_index().rename(columns={'点数': '自摸数'})
df_mo_point = df_zimo.groupby('选手').sum()['点数'].reset_index().rename(columns={'点数': '自摸点数'})

df_player = pd.DataFrame(player_result, columns=['选手'])
df_player = df_player.value_counts('选手').reset_index()
df_player = df_player.rename(columns={0: '场次'})

df_player = pd.merge(df_player, df_rong, on='选手', how='left')
df_player = pd.merge(df_player, df_mo, on='选手', how='left')
df_player = pd.merge(df_player, df_rong_list, on='选手', how='left')
df_player = pd.merge(df_player, df_mo_point, on='选手', how='left')
df_player['场均胡牌'] = round((df_player['荣和数'] + df_player['自摸数'])/df_player['场次'], 1)
df_player['平均打点'] = round((df_player['荣和点数'] + df_player['自摸点数'])/(df_player['荣和数'] + df_player['自摸数']), 0)

df_player = pd.merge(df_player, df_pao, on='选手', how='left')
df_player['场均点炮'] = round(df_player['点炮数']/df_player['场次'], 1)
df_player = pd.merge(df_player, df_pao_point, on='选手', how='left')
df_player['平均铳点'] = round(df_player['平均铳点'], 0)
df_player = df_player.drop(['荣和点数', '自摸点数'], axis=1)

df_dianpao.to_excel('record/dianpao.xlsx')
df_zimo.to_excel('record/zimo.xlsx')
df_player.to_excel('record/player.xlsx')
