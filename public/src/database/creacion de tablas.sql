-- =============================================================================
-- diagram name: diagrama de tablas
-- created on: 20/11/2024 9:39:59 p. m.
-- diagram version: 
-- =============================================================================

drop table if exists usuarios cascade;

create table usuarios (
	id_usuario bigserial not null,
	nombre varchar(30) not null,
	correo varchar(50) not null,
	contrasena varchar(100) not null,
	id_rol int8 not null,
	id_cargo int8 not null,
	id_organizacion int8 not null,
	primary key(id_usuario),
	constraint useruniquekey unique(nombre,correo)
);


drop table if exists rol cascade;

create table rol (
	id_rol bigserial not null,
	rol varchar(20) not null,
	primary key(id_rol)
);


drop table if exists tareas cascade;

create table tareas (
	id_tarea bigserial not null,
	titulo varchar(50) not null,
	descripcion varchar(200) not null,
	fecha date not null,
	categoria varchar(20) not null,
	id_usuario int8 not null,
	estado varchar(20) not null,
	primary key(id_tarea),
	constraint tareaskey unique(titulo,descripcion)
);


drop table if exists organizacion cascade;

create table organizacion (
	id_organizacion bigserial not null,
	organizacion varchar(30) not null,
	primary key(id_organizacion),
	constraint organizacionkey unique(organizacion)
);


drop table if exists cargo cascade;

create table cargo (
	id_cargo bigserial not null,
	cargo varchar(20) not null,
	primary key(id_cargo)
);



alter table usuarios add constraint ref_usuarios_to_rol foreign key (id_rol)
	references rol(id_rol)
	match simple
	on delete no action
	on update no action
	not deferrable;

alter table usuarios add constraint ref_usuarios_to_cargo foreign key (id_cargo)
	references cargo(id_cargo)
	match simple
	on delete no action
	on update no action
	not deferrable;

alter table usuarios add constraint ref_usuarios_to_organizacion foreign key (id_organizacion)
	references organizacion(id_organizacion)
	match simple
	on delete no action
	on update no action
	not deferrable;

alter table tareas add constraint ref_tareas_to_usuarios foreign key (id_usuario)
	references usuarios(id_usuario)
	match simple
	on delete no action
	on update no action
	not deferrable;


