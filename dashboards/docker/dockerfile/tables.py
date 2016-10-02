from horizon import tables

class DockerTable(tables.DataTable):

    name = tables.Column('name',verbose_name='Name')
    content = tables.Column('content',verbose_name='Content')

    class Meta(object):
        multi_select = True
        name = 'dockers'
