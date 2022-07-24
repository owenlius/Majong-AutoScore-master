import pandas as pd

filename = 'log-2022-7-22.ini'

with open(filename, 'rb') as f:
    log_text = f.read().decode('utf-8')

log_list_org = log_text.split('\n')

log_list = list(filter(lambda x: x[4:6] != '本场', log_list_org))

log_list = list(filter(lambda x: x != '', log_list))

log_list = list(filter(lambda x: x != 'log', log_list))

log_list = list(filter(lambda x: x[0:4] != '分数统计', log_list))

i = len(log_list) - 1

while i >= 0:
    if log_list[i] == '撤回':
        log_list.pop(i)
        log_list.pop(i-1)
        i -= 2
    else:
        i -= 1

dianpao_list = list(filter(lambda x: '点炮' in x, log_list))

dianpao_result = []
for i in dianpao_list:
    pao_player = i[0:i.index('点炮')-1]
    rong_player = i[i.index('点炮')+4:i.index('得到')-1]
    point = i[i.index('得到')+3:i.index('0 点')+1]
    dianpao_result.append([pao_player, rong_player, point])

zimo_list = list(filter(lambda x: '自摸' in x, log_list))

zimo_result = []
for i in zimo_list:
    zimo = i.split('\xa0')
    zimo_index = 0
    for index, j in enumerate(zimo):
        if '自摸' in j:
            zimo_index = index
    zimo_player = zimo[zimo_index-1]
    lost_list = list(filter(lambda x: '失去' in x, zimo))
    lost_list = [int(i[2:len(i)-2]) for i in lost_list]
    point = sum(lost_list)
    zimo_result.append([zimo_player, point])

df_dianpao = pd.DataFrame(dianpao_result)
df_dianpao.to_excel('dianpao.xlsx')

df_zimo = pd.DataFrame(zimo_result)
df_zimo.to_excel('zimo.xlsx')
